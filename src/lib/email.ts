import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { logAudit } from "@/lib/audit";

export type InquiryEmail = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budgetBand: string | null;
  timelineBand: string | null;
  message: string;
  sourcePath: string | null;
  sourceProjectTitle: string | null;
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/**
 * Notifies the studio inbox of a new enquiry. Never throws: a failed email
 * must not fail the submission. Failures are recorded in the audit log.
 */
export async function sendInquiryNotification(q: InquiryEmail): Promise<{ ok: boolean; id?: string; error?: string }> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const subject = `New enquiry from ${q.name}${q.company ? `, ${q.company}` : ""}`;
  const lines = [
    `${q.name} <${q.email}>${q.company ? ` at ${q.company}` : ""}`,
    q.budgetBand ? `Budget: ${q.budgetBand}` : null,
    q.timelineBand ? `Timeline: ${q.timelineBand}` : null,
    q.sourceProjectTitle ? `Was looking at: ${q.sourceProjectTitle}` : null,
    q.sourcePath ? `Sent from: ${siteUrl}${q.sourcePath}` : null,
    "",
    q.message,
    "",
    `Open in the admin panel: ${siteUrl}/admin/inquiries?id=${q.id}`,
  ].filter((l): l is string => l !== null);
  const text = lines.join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#000;max-width:600px">
<p style="margin:0 0 8px"><strong>${escapeHtml(q.name)}</strong> &lt;${escapeHtml(q.email)}&gt;${q.company ? ` at ${escapeHtml(q.company)}` : ""}</p>
<table style="border-collapse:collapse;font-size:14px;color:#5A6152;margin:0 0 16px">
${q.budgetBand ? `<tr><td style="padding:2px 12px 2px 0">Budget</td><td style="font-family:ui-monospace,monospace;color:#000">${escapeHtml(q.budgetBand)}</td></tr>` : ""}
${q.timelineBand ? `<tr><td style="padding:2px 12px 2px 0">Timeline</td><td style="font-family:ui-monospace,monospace;color:#000">${escapeHtml(q.timelineBand)}</td></tr>` : ""}
${q.sourceProjectTitle ? `<tr><td style="padding:2px 12px 2px 0">Looking at</td><td style="color:#000">${escapeHtml(q.sourceProjectTitle)}</td></tr>` : ""}
${q.sourcePath ? `<tr><td style="padding:2px 12px 2px 0">Sent from</td><td style="color:#000">${escapeHtml(siteUrl + q.sourcePath)}</td></tr>` : ""}
</table>
<p style="white-space:pre-wrap;margin:0 0 16px;padding:16px;background:#ECEEE8;border-radius:12px">${escapeHtml(q.message)}</p>
<p style="margin:0"><a href="${siteUrl}/admin/inquiries?id=${q.id}" style="display:inline-block;background:#D6F631;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600">Open in the admin panel</a></p>
</div>`;

  if (env.EMAIL_DRY_RUN === "true") {
    await logAudit({ action: "email.dry_run", entity: "Inquiry", entityId: q.id, diff: { to: env.INQUIRY_NOTIFY_EMAIL ?? null, subject } });
    return { ok: true, id: "dry-run" };
  }
  // Resend not set up yet: the enquiry is stored and visible in the inbox; note it and move on.
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.INQUIRY_NOTIFY_EMAIL) {
    await logAudit({ action: "email.unconfigured", entity: "Inquiry", entityId: q.id, diff: { subject } });
    return { ok: true, id: "unconfigured" };
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: env.INQUIRY_NOTIFY_EMAIL,
      replyTo: q.email,
      subject,
      text,
      html,
      tags: [{ name: "kind", value: "inquiry" }, { name: "inquiry_id", value: q.id }],
    });
    if (error) {
      await logAudit({ action: "email.failed", entity: "Inquiry", entityId: q.id, diff: { error: error.message, subject } });
      return { ok: false, error: error.message };
    }
    await logAudit({ action: "email.sent", entity: "Inquiry", entityId: q.id, diff: { resendId: data?.id ?? null, subject } });
    return { ok: true, id: data?.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await logAudit({ action: "email.failed", entity: "Inquiry", entityId: q.id, diff: { error: message, subject } });
    return { ok: false, error: message };
  }
}
