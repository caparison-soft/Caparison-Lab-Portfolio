import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runBackup } from "@/lib/backup";
import { storageConfigured } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Weekly (see vercel.json): logical dump of the public schema to R2 under
 * backups/, keeping the newest eight. Runs where the credentials already
 * live, so nothing has to be copied into GitHub. Supabase free has no
 * automated backups of its own; this is the only copy.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!env.BACKUP_KEY) {
    return NextResponse.json({ ok: false, error: "BACKUP_KEY is not set; refusing to write an unencrypted backup." }, { status: 503 });
  }
  if (!storageConfigured()) {
    return NextResponse.json({ ok: false, error: "Media storage is not configured; nowhere to put the backup." }, { status: 503 });
  }
  const startedAt = Date.now();
  try {
    const result = await runBackup();
    const ms = Date.now() - startedAt;
    console.log(JSON.stringify({ job: "backup", ok: true, ms, ...result }));
    return NextResponse.json({ ok: true, ms, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(JSON.stringify({ job: "backup", ok: false, error: message }));
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
