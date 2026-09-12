import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Supabase free projects pause after 7 days without database activity.
 * Vercel Cron calls this every 3 days (see vercel.json) so the project
 * never idles out. Load-bearing: do not remove.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`select 1`;
    const ms = Date.now() - startedAt;
    console.log(JSON.stringify({ job: "keepalive", ok: true, ms, at: new Date().toISOString() }));
    return NextResponse.json({ ok: true, ms, at: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(JSON.stringify({ job: "keepalive", ok: false, error: message, at: new Date().toISOString() }));
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
