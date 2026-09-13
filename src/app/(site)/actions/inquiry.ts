"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBlocks, t } from "@/lib/queries/content";
import { logAudit } from "@/lib/audit";
import { sendInquiryNotification } from "@/lib/email";

/**
 * Enquiry submission: Zod, honeypot, durable rate limit, DB row, email.
 * Rate limits are counted from the audit log so they hold across serverless
 * instances: 5 per hour per IP, 3 per day per email address.
 */

export type InquiryState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message" | "form", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  budgetBand: z.string().trim().max(60).optional().or(z.literal("")),
  timelineBand: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
  // Honeypot. Real people never fill this in; it is visually hidden.
  website: z.string().max(0),
  sourceProjectSlug: z.string().trim().max(120).optional().or(z.literal("")),
  sourcePath: z.string().trim().max(300).optional().or(z.literal("")),
});

const PER_IP_PER_HOUR = 5;
const PER_EMAIL_PER_DAY = 3;

async function clientMeta(): Promise<{ ip: string; referrer: string | null; userAgent: string | null }> {
  const h = await headers();
  return {
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown",
    referrer: h.get("referer"),
    userAgent: h.get("user-agent"),
  };
}

async function rateLimited(ip: string, email: string): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [byIp, byEmail] = await Promise.all([
    prisma.auditLog.count({ where: { action: "inquiry.submit", createdAt: { gte: hourAgo }, diff: { path: ["ip"], equals: ip } } }),
    prisma.auditLog.count({ where: { action: "inquiry.submit", createdAt: { gte: dayAgo }, diff: { path: ["email"], equals: email.toLowerCase() } } }),
  ]);
  return byIp >= PER_IP_PER_HOUR || byEmail >= PER_EMAIL_PER_DAY;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const blocks = await getBlocks(["Contact form", "Homepage"]);
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: InquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "website") return { ok: true, message: t(blocks, "home.contact.successMessage") }; // bots get a quiet success
      if (field === "email") errors.email = t(blocks, "form.error.email");
      else if (field === "name") errors.name = t(blocks, "form.error.required");
      else if (field === "message") errors.message = t(blocks, "form.error.required");
      else errors.form = t(blocks, "form.error.generic");
    }
    return { ok: false, errors };
  }

  const d = parsed.data;
  const meta = await clientMeta();

  if (await rateLimited(meta.ip, d.email)) {
    await logAudit({ action: "inquiry.rate_limited", entity: "Inquiry", diff: { ip: meta.ip, email: d.email.toLowerCase() } });
    return { ok: false, errors: { form: t(blocks, "form.error.rateLimited") } };
  }

  let created: { id: string; sourceProjectTitle: string | null };
  try {
    const sourceProject = d.sourceProjectSlug
      ? await prisma.project.findFirst({ where: { slug: d.sourceProjectSlug, deletedAt: null }, select: { id: true, title: true } })
      : null;

    const row = await prisma.inquiry.create({
      data: {
        name: d.name,
        email: d.email,
        company: d.company || null,
        budgetBand: d.budgetBand || null,
        timelineBand: d.timelineBand || null,
        message: d.message,
        sourceProjectId: sourceProject?.id ?? null,
        sourcePath: d.sourcePath || null,
        referrer: meta.referrer,
      },
      select: { id: true },
    });
    created = { id: row.id, sourceProjectTitle: sourceProject?.title ?? null };
    await logAudit({ action: "inquiry.submit", entity: "Inquiry", entityId: row.id, diff: { ip: meta.ip, email: d.email.toLowerCase(), userAgent: meta.userAgent } });
  } catch (error) {
    console.error("inquiry.create failed", error);
    return { ok: false, errors: { form: t(blocks, "form.error.generic") } };
  }

  // Notification is best-effort; the enquiry is already saved.
  await sendInquiryNotification({
    id: created.id,
    name: d.name,
    email: d.email,
    company: d.company || null,
    budgetBand: d.budgetBand || null,
    timelineBand: d.timelineBand || null,
    message: d.message,
    sourcePath: d.sourcePath || null,
    sourceProjectTitle: created.sourceProjectTitle,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { ok: true, message: t(blocks, "home.contact.successMessage") };
}
