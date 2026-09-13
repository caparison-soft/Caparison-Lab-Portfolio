import "server-only";
import { createCipheriv, randomBytes } from "node:crypto";
import { gzipSync } from "node:zlib";
import { Client } from "pg";
import { env } from "@/lib/env";
import { deleteObjects, listAll, putObject } from "@/lib/r2";

/**
 * Logical database backup without pg_dump (Vercel functions have none).
 * Every base table in the public schema is read over the direct connection
 * and written as one gzipped JSON document to R2 under backups/. The schema
 * itself lives in prisma/migrations, so a restore is: migrate, then load
 * rows (scripts/restore-backup.ts). Keeps the newest KEEP backups.
 *
 * The bucket is publicly readable, so the gzipped document is encrypted with
 * AES-256-GCM under BACKUP_KEY. File layout: magic "CLB1" | 12-byte IV |
 * 16-byte auth tag | ciphertext.
 */

export const BACKUP_PREFIX = "backups/";
export const KEEP = 8;

export type BackupDocument = {
  version: 1;
  at: string;
  database: string;
  tables: Record<string, { columns: string[]; rows: unknown[][] }>;
};

export async function dumpDatabase(): Promise<BackupDocument> {
  const client = new Client({ connectionString: env.DIRECT_URL });
  await client.connect();
  try {
    const { rows: tables } = await client.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public' and table_type = 'BASE TABLE'
       order by table_name`,
    );
    const doc: BackupDocument = { version: 1, at: new Date().toISOString(), database: "public", tables: {} };
    for (const { table_name } of tables) {
      const res = await client.query({ text: `select * from "${table_name.replace(/"/g, '""')}"`, rowMode: "array" });
      doc.tables[table_name] = { columns: res.fields.map((f) => f.name), rows: res.rows as unknown[][] };
    }
    return doc;
  } finally {
    await client.end();
  }
}

export const MAGIC = Buffer.from("CLB1");

export function encryptBackup(plain: Buffer, hexKey: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(hexKey, "hex"), iv);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), enc]);
}

export type BackupResult = { key: string; bytes: number; tables: number; rows: number; deleted: string[] };

/** Dump, gzip, encrypt, upload, prune. Throws on any failure so the cron reports it. */
export async function runBackup(): Promise<BackupResult> {
  if (!env.BACKUP_KEY) throw new Error("BACKUP_KEY is not set; refusing to write an unencrypted backup.");
  const doc = await dumpDatabase();
  const body = encryptBackup(gzipSync(Buffer.from(JSON.stringify(doc)), { level: 9 }), env.BACKUP_KEY);
  const stamp = doc.at.replace(/[:.]/g, "-");
  const key = `${BACKUP_PREFIX}${stamp}.json.gz.enc`;
  await putObject(key, body, "application/octet-stream");

  const existing = (await listAll(BACKUP_PREFIX)).map((o) => o.key).sort();
  const stale = existing.slice(0, Math.max(0, existing.length - KEEP));
  if (stale.length > 0) await deleteObjects(stale);

  const rows = Object.values(doc.tables).reduce((n, t) => n + t.rows.length, 0);
  return { key, bytes: body.byteLength, tables: Object.keys(doc.tables).length, rows, deleted: stale };
}
