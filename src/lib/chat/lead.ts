import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { sendInquiryNotification } from "@/lib/email";

/**
 * The assistant's create_enquiry tool. Writes an Inquiry the same way the
 * contact form does (src/app/(site)/actions/inquiry.ts) and shares its limits:
 * both count the same `inquiry.submit` audit rows, 5 per hour per IP and 3 per
 * day per email address. Keep the two numbers in step with that file.
 */

const PER_IP_PER_HOUR = 5;
const PER_EMAIL_PER_DAY = 3;

export const enquiryInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  business: z.string().trim().min(1).max(120),
  need: z.string().trim().min(3).max(4000),
  phone: z.string().trim().max(40).optional(),
  location: z.string().trim().max(120).optional(),
});
export type EnquiryInput = z.infer<typeof enquiryInput>;

export const ENQUIRY_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    name: { type: "string", description: "The visitor's name, as they gave it." },
    email: { type: "string", description: "The visitor's email address, as they gave it." },
    business: { type: "string", description: "The name of their business." },
    need: { type: "string", description: "What they need, in their words: the review, a website, booking, a question for the team. Include their website or Google listing if they gave one." },
    phone: { type: "string", description: "Phone number, only if they gave one." },
    location: { type: "string", description: "Town, region or country, only if they gave one." },
  },
  required: ["name", "email", "business", "need"],
  additionalProperties: false,
};

export type RequestMeta = { ip: string; userAgent: string | null; referrer: string | null };

export type EnquiryResult = { ok: true; id: string } | { ok: false; reason: "invalid" | "rate_limited" | "failed"; detail?: string };

async function rateLimited(ip: string, email: string): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [byIp, byEmail] = await Promise.all([
    prisma.auditLog.count({ where: { action: "inquiry.submit", createdAt: { gte: hourAgo }, diff: { path: ["ip"], equals: ip } } }),
    prisma.auditLog.count({ where: { action: "inquiry.submit", createdAt: { gte: dayAgo }, diff: { path: ["email"], equals: email.toLowerCase() } } }),
  ]);
  return byIp >= PER_IP_PER_HOUR || byEmail >= PER_EMAIL_PER_DAY;
}

/** Validates the model's tool input, then stores and notifies like the contact form. */
export async function createChatEnquiry(raw: unknown, meta: RequestMeta): Promise<EnquiryResult> {
  const parsed = enquiryInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  const d = parsed.data;

  if (await rateLimited(meta.ip, d.email)) {
    await logAudit({ action: "inquiry.rate_limited", entity: "Inquiry", diff: { ip: meta.ip, email: d.email.toLowerCase(), via: "chat" } });
    return { ok: false, reason: "rate_limited" };
  }

  // Stored data for the admin inbox, not public copy.
  const message = [d.need, d.location ? `Location: ${d.location}` : null, "Sent through the website assistant."].filter(Boolean).join("\n\n");

  let id: string;
  try {
    const row = await prisma.inquiry.create({
      data: {
        name: d.name,
        email: d.email,
        company: d.business,
        phone: d.phone || null,
        projectType: "Website assistant",
        message,
        sourcePath: "/chat",
        referrer: meta.referrer,
      },
      select: { id: true },
    });
    id = row.id;
    await logAudit({ action: "inquiry.submit", entity: "Inquiry", entityId: id, diff: { ip: meta.ip, email: d.email.toLowerCase(), userAgent: meta.userAgent, via: "chat" } });
  } catch (error) {
    console.error("chat inquiry.create failed", error);
    return { ok: false, reason: "failed" };
  }

  // Best-effort, as on the form: the enquiry is already saved.
  await sendInquiryNotification({
    id,
    name: d.name,
    email: d.email,
    company: d.business,
    budgetBand: null,
    timelineBand: null,
    projectType: "Website assistant",
    message: d.phone ? `${message}\n\nPhone: ${d.phone}` : message,
    sourcePath: "/chat",
    sourceProjectTitle: null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { ok: true, id };
}
