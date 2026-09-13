"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { CACHE_TAGS } from "@/lib/queries/content";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const inquiryStatus = z.enum(["NEW", "READ", "REPLIED", "QUALIFIED", "WON", "LOST"]);
export type InquiryStatus = z.infer<typeof inquiryStatus>;

/** Inline status change from the dashboard and the inbox. */
export async function updateInquiryStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await assertAdmin();
    const parsed = inquiryStatus.safeParse(status);
    if (!parsed.success) return { ok: false, error: "Unknown status." };
    const before = await prisma.inquiry.findUnique({ where: { id }, select: { status: true } });
    if (!before) return { ok: false, error: "That enquiry no longer exists." };
    await prisma.inquiry.update({ where: { id }, data: { status: parsed.data } });
    await logAudit({ userId: user.id, action: "inquiry.status", entity: "Inquiry", entityId: id, diff: { from: before.status, to: parsed.data } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update the status." };
  }
}

/** Purge every public cache tag so the site reflects the database without a redeploy. */
export async function revalidateSite(): Promise<ActionResult<{ at: string }>> {
  try {
    const user = await assertAdmin();
    for (const tag of Object.values(CACHE_TAGS)) revalidateTag(tag);
    revalidatePath("/", "layout");
    const at = new Date().toISOString();
    await logAudit({ userId: user.id, action: "site.revalidate", entity: "site", diff: { tags: Object.values(CACHE_TAGS) } });
    return { ok: true, data: { at } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not revalidate." };
  }
}

/** Internal notes are the only editable text on an enquiry. */
export async function saveInquiryNotes(id: string, notes: string): Promise<ActionResult> {
  try {
    const user = await assertAdmin();
    const value = z.string().max(5000).parse(notes);
    await prisma.inquiry.update({ where: { id }, data: { internalNotes: value.trim() || null } });
    await logAudit({ userId: user.id, action: "inquiry.notes", entity: "Inquiry", entityId: id });
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save the notes." };
  }
}

/** Opening a new enquiry marks it read. Silent when already past NEW. */
export async function markInquiryRead(id: string): Promise<ActionResult> {
  try {
    const user = await assertAdmin();
    const r = await prisma.inquiry.updateMany({ where: { id, status: "NEW" }, data: { status: "READ" } });
    if (r.count > 0) {
      await logAudit({ userId: user.id, action: "inquiry.status", entity: "Inquiry", entityId: id, diff: { from: "NEW", to: "READ" } });
      revalidatePath("/admin");
      revalidatePath("/admin/inquiries");
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update." };
  }
}
