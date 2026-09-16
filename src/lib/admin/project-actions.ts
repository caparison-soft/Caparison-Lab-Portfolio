"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { CACHE_TAGS } from "@/lib/queries/content";
import { fieldErrors, projectSchema, slugify, tagSchema, type ProjectInput } from "@/lib/admin/schemas";
import type { Prisma } from "@/generated/prisma/client";

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string; fields?: Record<string, string> };
export type SimpleResult = { ok: true } | { ok: false; error: string };

function bust() {
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath("/admin/projects");
  // The tag clears the data cache, but every public page is statically
  // rendered on a one-hour window, so without this a newly published project
  // did not reach the home showcase, the nav panel or the sitemap until that
  // window passed (found 2026-09-15).
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "untitled";
  let n = 2;
  while (await prisma.project.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/** "New project" creates a draft and opens the editor, so autosave has a row to write to. */
export async function createProject(): Promise<never> {
  const user = await assertAdmin();
  const last = await prisma.project.aggregate({ _max: { order: true } });
  const slug = await uniqueSlug("untitled-project");
  const p = await prisma.project.create({
    data: { title: "Untitled project", slug, summary: "", status: "DRAFT", order: (last._max.order ?? 0) + 1 },
    select: { id: true },
  });
  await logAudit({ userId: user.id, action: "project.create", entity: "Project", entityId: p.id });
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${p.id}`);
}

export async function checkSlug(slug: string, excludeId: string): Promise<{ available: boolean }> {
  await assertAdmin();
  const hit = await prisma.project.findFirst({ where: { slug, id: { not: excludeId } }, select: { id: true } });
  return { available: !hit };
}

export async function saveProject(id: string, values: ProjectInput): Promise<SaveResult> {
  try {
    const user = await assertAdmin();
    const parsed = projectSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Some fields need attention.", fields: fieldErrors(parsed.error) };
    const v = parsed.data;

    const existing = await prisma.project.findUnique({ where: { id }, select: { id: true, status: true, slug: true, publishedAt: true } });
    if (!existing) return { ok: false, error: "This project no longer exists." };

    const clash = await prisma.project.findFirst({ where: { slug: v.slug, id: { not: id } }, select: { id: true } });
    if (clash) return { ok: false, error: "That slug is taken.", fields: { slug: "Another project already uses this slug." } };

    const publishedAt =
      v.status === "PUBLISHED" ? (v.publishedAt ? new Date(v.publishedAt) : (existing.publishedAt ?? new Date())) : v.publishedAt ? new Date(v.publishedAt) : null;

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          title: v.title, slug: v.slug, summary: v.summary, body: (v.body ?? undefined) as Prisma.InputJsonValue | undefined,
          brief: (v.brief ?? undefined) as Prisma.InputJsonValue | undefined,
          whatWeBuilt: (v.whatWeBuilt ?? undefined) as Prisma.InputJsonValue | undefined,
          storySide: v.storySide,
          categoryId: v.categoryId, clientName: v.clientName, clientLogoUrl: v.clientLogoUrl, year: v.year, teamSize: v.teamSize,
          liveUrl: v.liveUrl, repoUrl: v.repoUrl, budgetMin: v.budgetMin, budgetMax: v.budgetMax, budgetCurrency: v.budgetCurrency,
          budgetDisplay: v.budgetDisplay, durationValue: v.durationValue, durationUnit: v.durationUnit, durationDisplay: v.durationDisplay,
          videoUrl: v.videoUrl, videoProvider: v.videoProvider, ctaMode: v.ctaMode, ctaLabel: v.ctaLabel, ctaHref: v.ctaHref, ctaNote: v.ctaNote,
          metaTitle: v.metaTitle, metaDescription: v.metaDescription, ogImageUrl: v.ogImageUrl,
          status: v.status, featured: v.featured, currentlyBuilding: v.currentlyBuilding, buildNote: v.buildNote, publishedAt,
          outcome: v.outcome, role: v.role, platforms: v.platforms, stage: v.stage, launchedAt: v.launchedAt ? new Date(v.launchedAt) : null, afterNote: v.afterNote,
          team: { set: v.teamMemberIds.map((id) => ({ id })) },
        },
      });
      await tx.projectDecision.deleteMany({ where: { projectId: id } });
      if (v.decisions.length > 0) await tx.projectDecision.createMany({ data: v.decisions.map((d, i) => ({ projectId: id, title: d.title, reason: d.reason, order: i })) });
      await tx.projectPhase.deleteMany({ where: { projectId: id } });
      if (v.phases.length > 0) await tx.projectPhase.createMany({ data: v.phases.map((f, i) => ({ projectId: id, label: f.label, when: f.when, note: f.note, order: i })) });
      await tx.projectTag.deleteMany({ where: { projectId: id } });
      if (v.tagIds.length > 0) await tx.projectTag.createMany({ data: v.tagIds.map((tagId) => ({ projectId: id, tagId })), skipDuplicates: true });
      await tx.projectMetric.deleteMany({ where: { projectId: id } });
      if (v.metrics.length > 0) await tx.projectMetric.createMany({ data: v.metrics.map((m, i) => ({ projectId: id, label: m.label, value: m.value, note: m.note, period: m.period, source: m.source, order: i })) });
    });

    const action = existing.status !== "PUBLISHED" && v.status === "PUBLISHED" ? "project.publish" : v.status !== "PUBLISHED" && existing.status === "PUBLISHED" ? "project.unpublish" : "project.save";
    await logAudit({ userId: user.id, action, entity: "Project", entityId: id, diff: { title: v.title, status: v.status } });
    bust();
    revalidatePath(`/admin/projects/${id}`);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (error) {
    console.error("saveProject", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function setProjectsStatus(ids: string[], status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    if (ids.length === 0) return { ok: false, error: "Select at least one project." };
    await prisma.project.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status, ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}) },
    });
    await logAudit({ userId: user.id, action: `project.bulk_${status.toLowerCase()}`, entity: "Project", diff: { ids } });
    bust();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update." };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    await prisma.project.update({ where: { id }, data: { featured } });
    await logAudit({ userId: user.id, action: "project.featured", entity: "Project", entityId: id, diff: { featured } });
    bust();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update." };
  }
}

export async function reorderProjects(ids: string[]): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    await prisma.$transaction(ids.map((id, i) => prisma.project.update({ where: { id }, data: { order: i + 1 } })));
    await logAudit({ userId: user.id, action: "project.reorder", entity: "Project", diff: { ids } });
    bust();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not reorder." };
  }
}

/** Soft delete. Requires the title typed back, checked server-side. */
export async function deleteProject(id: string, typedTitle: string): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    const p = await prisma.project.findUnique({ where: { id }, select: { title: true } });
    if (!p) return { ok: false, error: "This project no longer exists." };
    if (typedTitle.trim() !== p.title.trim()) return { ok: false, error: "The title you typed doesn't match." };
    await prisma.project.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED", featured: false, currentlyBuilding: false } });
    await logAudit({ userId: user.id, action: "project.delete", entity: "Project", entityId: id, diff: { title: p.title } });
    bust();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete." };
  }
}

export async function createTag(name: string, kind: "STACK" | "INDUSTRY" | "SERVICE"): Promise<{ ok: true; tag: { id: string; name: string; slug: string; kind: string } } | { ok: false; error: string }> {
  try {
    const user = await assertAdmin();
    const parsed = tagSchema.safeParse({ name, kind });
    if (!parsed.success) return { ok: false, error: "Tag needs a name." };
    const slug = slugify(parsed.data.name);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) return { ok: true, tag: existing };
    const last = await prisma.tag.aggregate({ _max: { order: true }, where: { kind: parsed.data.kind } });
    const tag = await prisma.tag.create({ data: { name: parsed.data.name, slug, kind: parsed.data.kind, order: (last._max.order ?? 0) + 1 } });
    await logAudit({ userId: user.id, action: "tag.create", entity: "Tag", entityId: tag.id, diff: { name: tag.name, kind } });
    revalidateTag(CACHE_TAGS.projects);
    return { ok: true, tag };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create the tag." };
  }
}
