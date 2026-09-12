"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBlocks, t } from "@/lib/queries/content";

/**
 * Enquiry submission. Phase 3 wires validation, honeypot and the DB row so
 * the form is real from day one. Phase 8 adds rate limiting, the Resend
 * notification and the admin inbox.
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
  try {
    const sourceProject = d.sourceProjectSlug
      ? await prisma.project.findFirst({ where: { slug: d.sourceProjectSlug, deletedAt: null }, select: { id: true } })
      : null;

    await prisma.inquiry.create({
      data: {
        name: d.name,
        email: d.email,
        company: d.company || null,
        budgetBand: d.budgetBand || null,
        timelineBand: d.timelineBand || null,
        message: d.message,
        sourceProjectId: sourceProject?.id ?? null,
        sourcePath: d.sourcePath || null,
      },
    });
  } catch (error) {
    console.error("inquiry.create failed", error);
    return { ok: false, errors: { form: t(blocks, "form.error.generic") } };
  }

  return { ok: true, message: t(blocks, "home.contact.successMessage") };
}
