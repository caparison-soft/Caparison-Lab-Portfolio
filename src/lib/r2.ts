import "server-only";
import { DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

/**
 * Cloudflare R2 through the S3 API. Region is always "auto". In development
 * R2_ENDPOINT points at scripts/dev-s3.mjs; in production it is unset and the
 * account endpoint is used.
 */
const globalForR2 = globalThis as unknown as { r2?: S3Client };

function create(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT ?? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: Boolean(env.R2_ENDPOINT),
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });
}

export const r2: S3Client = globalForR2.r2 ?? create();
if (env.NODE_ENV !== "production") globalForR2.r2 = r2;

export const BUCKET = env.R2_BUCKET;
export const IMMUTABLE = "public, max-age=31536000, immutable";

/** Presigned PUT, five minutes. The browser uploads directly; bytes never touch a function. */
export async function presignPut(key: string, contentType: string): Promise<string> {
  return getSignedUrl(r2, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn: 300 });
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType, CacheControl: IMMUTABLE }));
}

export async function getObjectBuffer(key: string): Promise<{ body: Buffer; contentType: string | undefined; size: number }> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const bytes = await res.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Object ${key} is empty.`);
  return { body: Buffer.from(bytes), contentType: res.ContentType, size: bytes.byteLength };
}

export async function headObject(key: string): Promise<{ size: number; contentType: string | undefined } | null> {
  try {
    const res = await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return { size: res.ContentLength ?? 0, contentType: res.ContentType };
  } catch {
    return null;
  }
}

export type R2Object = { key: string; size: number; lastModified: Date | undefined };

export async function listAll(prefix: string): Promise<R2Object[]> {
  const out: R2Object[] = [];
  let token: string | undefined;
  do {
    const res = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }));
    for (const o of res.Contents ?? []) if (o.Key) out.push({ key: o.Key, size: o.Size ?? 0, lastModified: o.LastModified });
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return out;
}

/** Delete every object under a prefix. Throws if R2 reports any failure, so orphans never go quiet. */
export async function deletePrefix(prefix: string): Promise<number> {
  const objects = await listAll(prefix.endsWith("/") ? prefix : `${prefix}/`);
  if (objects.length === 0) return 0;
  for (let i = 0; i < objects.length; i += 1000) {
    const batch = objects.slice(i, i + 1000);
    const res = await r2.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: batch.map((o) => ({ Key: o.key })), Quiet: false } }));
    if (res.Errors && res.Errors.length > 0) {
      throw new Error(`R2 refused to delete ${res.Errors.length} object(s): ${res.Errors.map((e) => `${e.Key} (${e.Code})`).join(", ")}`);
    }
  }
  return objects.length;
}
