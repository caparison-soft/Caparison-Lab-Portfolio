import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { reconcileMedia } from "@/lib/reconcile";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Weekly: diff R2 against Media rows and report orphans in the admin library. Never deletes. */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const report = await reconcileMedia();
    console.log(JSON.stringify({ job: "reconcile", ok: true, orphans: report.orphanPrefixes.length, missing: report.missingObjects.length, at: report.at }));
    return NextResponse.json({ ok: true, ...report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(JSON.stringify({ job: "reconcile", ok: false, error: message }));
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
