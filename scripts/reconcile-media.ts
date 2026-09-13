/** Run the R2 reconciliation by hand: npm run media:reconcile */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 }) });
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: Boolean(process.env.R2_ENDPOINT),
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "" },
});

async function main() {
  const keys: { key: string; size: number }[] = [];
  let token: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, ContinuationToken: token }));
    for (const o of res.Contents ?? []) if (o.Key && !o.Key.startsWith("backups/")) keys.push({ key: o.Key, size: o.Size ?? 0 });
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  const prefixes = new Map<string, number>();
  for (const k of keys) { const p = k.key.split("/").slice(0, -1).join("/"); prefixes.set(p, (prefixes.get(p) ?? 0) + 1); }
  const known = new Set((await prisma.media.findMany({ select: { keyPrefix: true } })).map((m) => m.keyPrefix));
  const orphans = Array.from(prefixes.keys()).filter((p) => !known.has(p));
  console.log(`${keys.length} objects in ${prefixes.size} folders; ${known.size} media rows; ${orphans.length} orphan folder(s).`);
  for (const o of orphans) console.log("  orphan:", o);
  await prisma.auditLog.create({ data: { action: "media.reconcile", entity: "Media", diff: { at: new Date().toISOString(), orphanPrefixes: orphans.map((p) => ({ prefix: p, objects: prefixes.get(p), bytes: 0 })), missingObjects: [], totalObjects: keys.length, totalBytes: keys.reduce((s, k) => s + k.size, 0) } } });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
