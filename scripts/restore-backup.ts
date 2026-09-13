/**
 * Restore a backups/<stamp>.json.gz document (written by /api/cron/backup)
 * into the database at DIRECT_URL.
 *
 *   npx tsx scripts/restore-backup.ts <path-or-key> [--yes]
 *
 * <path-or-key> is a local .json.gz.enc file, or an R2 key such as
 * backups/2026-09-13T04-00-00-000Z.json.gz.enc (fetched with the R2_*
 * variables). Backups are AES-256-GCM encrypted; BACKUP_KEY must match.
 * The target must already have the schema (npm run db:migrate). Every public
 * table in the document is truncated and reloaded inside one transaction with
 * triggers and foreign keys deferred; _prisma_migrations is left alone.
 * Without --yes it only reports what it would do.
 */
import "dotenv/config";
import { createDecipheriv } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Client } from "pg";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

type Doc = { version: 1; at: string; tables: Record<string, { columns: string[]; rows: unknown[][] }> };

/** Layout: "CLB1" | 12-byte IV | 16-byte tag | ciphertext. Plain gzip (no magic) passes through for old files. */
function decrypt(bytes: Buffer): Buffer {
  if (bytes.subarray(0, 4).toString() !== "CLB1") return bytes;
  const hexKey = process.env.BACKUP_KEY;
  if (!hexKey || !/^[0-9a-f]{64}$/i.test(hexKey)) throw new Error("BACKUP_KEY (64 hex characters) is required to decrypt this backup.");
  const iv = bytes.subarray(4, 16);
  const tag = bytes.subarray(16, 32);
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(hexKey, "hex"), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(bytes.subarray(32)), decipher.final()]);
}

async function load(source: string): Promise<Doc> {
  let bytes: Buffer;
  if (source.startsWith("backups/")) {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT } = process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) throw new Error("R2_* variables are required to fetch a key.");
    const s3 = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT ?? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: Boolean(R2_ENDPOINT),
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
    const res = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: source }));
    const arr = await res.Body?.transformToByteArray();
    if (!arr) throw new Error(`Empty object: ${source}`);
    bytes = Buffer.from(arr);
  } else {
    bytes = readFileSync(source);
  }
  const doc = JSON.parse(gunzipSync(decrypt(bytes)).toString("utf8")) as Doc;
  if (doc.version !== 1 || !doc.tables) throw new Error("Not a version 1 backup document.");
  return doc;
}

async function main() {
  const [source, flag] = process.argv.slice(2);
  if (!source) throw new Error("Usage: tsx scripts/restore-backup.ts <path-or-key> [--yes]");
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL is required.");
  const apply = flag === "--yes";

  const doc = await load(source);
  const names = Object.keys(doc.tables).filter((t) => t !== "_prisma_migrations");
  const total = names.reduce((n, t) => n + doc.tables[t].rows.length, 0);
  console.log(`Backup from ${doc.at}: ${names.length} tables, ${total} rows.`);
  for (const t of names) console.log(`  ${t}: ${doc.tables[t].rows.length}`);
  if (!apply) {
    console.log("Dry run. Add --yes to truncate and reload these tables.");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("set local session_replication_role = 'replica'"); // skip triggers and FK checks while loading
    const quoted = names.map((t) => `"${t.replace(/"/g, '""')}"`);
    if (quoted.length > 0) await client.query(`truncate ${quoted.join(", ")} restart identity cascade`);
    for (const t of names) {
      const { columns, rows } = doc.tables[t];
      if (rows.length === 0) continue;
      // Column types decide the encoding: json/jsonb values are sent as JSON
      // text, array columns as JS arrays (pg serialises them), the rest as-is.
      const { rows: meta } = await client.query<{ column_name: string; data_type: string }>(
        "select column_name, data_type from information_schema.columns where table_schema = 'public' and table_name = $1",
        [t],
      );
      const kind = new Map(meta.map((m) => [m.column_name, m.data_type]));
      const encode = (col: string, v: unknown) => {
        if (v === null || v === undefined) return null;
        const dt = kind.get(col);
        if (dt === "json" || dt === "jsonb") return JSON.stringify(v);
        if (dt === "ARRAY") return Array.isArray(v) ? v : [v];
        return v;
      };
      const cols = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ");
      const chunk = 500;
      for (let i = 0; i < rows.length; i += chunk) {
        const slice = rows.slice(i, i + chunk);
        const params: unknown[] = [];
        const tuples = slice
          .map((r) => `(${r.map((v, ci) => { params.push(encode(columns[ci], v)); return `$${params.length}`; }).join(", ")})`)
          .join(", ");
        await client.query(`insert into "${t.replace(/"/g, '""')}" (${cols}) values ${tuples}`, params);
      }
      console.log(`  loaded ${t}: ${rows.length}`);
    }
    await client.query("commit");
    console.log("Restore complete.");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
