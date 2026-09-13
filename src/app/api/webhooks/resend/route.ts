import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Resend delivery events (delivered, bounced, complained), signed by Svix.
 * Verified when RESEND_WEBHOOK_SECRET is set; refused otherwise so an
 * unconfigured endpoint can never be fed fake events.
 */
function verify(secret: string, id: string, timestamp: string, body: string, signatures: string): boolean {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  const ageOk = Math.abs(Date.now() / 1000 - Number(timestamp)) < 5 * 60;
  return ageOk && signatures.split(" ").some((s) => {
    const [, sig] = s.split(",");
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(request: NextRequest) {
  if (!env.RESEND_WEBHOOK_SECRET) return NextResponse.json({ ok: false, error: "Webhook not configured." }, { status: 503 });
  const body = await request.text();
  const id = request.headers.get("svix-id") ?? "";
  const ts = request.headers.get("svix-timestamp") ?? "";
  const sig = request.headers.get("svix-signature") ?? "";
  if (!verify(env.RESEND_WEBHOOK_SECRET, id, ts, body, sig)) return NextResponse.json({ ok: false, error: "Bad signature." }, { status: 401 });

  let event: { type?: string; data?: { email_id?: string; to?: string[]; subject?: string; tags?: { name: string; value: string }[] } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 }); }
  const type = event.type ?? "unknown";
  const inquiryId = event.data?.tags?.find((t) => t.name === "inquiry_id")?.value ?? null;
  await logAudit({ action: `email.${type.replace(/^email\./, "")}`, entity: "Inquiry", entityId: inquiryId, diff: { resendId: event.data?.email_id ?? null, subject: event.data?.subject ?? null } });
  return NextResponse.json({ ok: true });
}
