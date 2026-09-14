"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { CACHE_TAGS } from "@/lib/queries/content";
import { contentEntrySchema, entitySchemas, fieldErrors, settingsSchema, slugify, type EntityName } from "@/lib/admin/schemas";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

export type EntityResult = { ok: true; id: string } | { ok: false; error: string; fields?: Record<string, string> };
export type SimpleResult = { ok: true } | { ok: false; error: string };

const meta: Record<EntityName, { tag: string; path: string; label: string }> = {
  capability: { tag: CACHE_TAGS.capabilities, path: "/admin/capabilities", label: "Capability" },
  testimonial: { tag: CACHE_TAGS.testimonials, path: "/admin/testimonials", label: "Testimonial" },
  processStep: { tag: CACHE_TAGS.process, path: "/admin/process", label: "ProcessStep" },
  faq: { tag: CACHE_TAGS.faqs, path: "/admin/faqs", label: "Faq" },
  teamMember: { tag: CACHE_TAGS.team, path: "/admin/team", label: "TeamMember" },
  stat: { tag: CACHE_TAGS.stats, path: "/admin/stats", label: "Stat" },
  category: { tag: CACHE_TAGS.projects, path: "/admin/types", label: "Category" },
};

function bust(entity: EntityName) {
  revalidateTag(meta[entity].tag);
  revalidatePath(meta[entity].path);
  revalidatePath("/admin");
}

const doc = (text: string): Prisma.InputJsonObject => ({
  type: "doc",
  content: text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).map((t) => ({ type: "paragraph", content: [{ type: "text", text: t }] })),
});

async function nextOrder(entity: EntityName): Promise<number> {
  const agg =
    entity === "capability" ? await prisma.capability.aggregate({ _max: { order: true } })
    : entity === "testimonial" ? await prisma.testimonial.aggregate({ _max: { order: true } })
    : entity === "processStep" ? await prisma.processStep.aggregate({ _max: { order: true } })
    : entity === "faq" ? await prisma.faq.aggregate({ _max: { order: true } })
    : entity === "teamMember" ? await prisma.teamMember.aggregate({ _max: { order: true } })
    : entity === "category" ? await prisma.category.aggregate({ _max: { order: true } })
    : await prisma.stat.aggregate({ _max: { order: true } });
  return (agg._max.order ?? 0) + 1;
}

/** Create or update one of the simple entities. Values are validated by the entity's schema. */
export async function saveEntity(entity: EntityName, id: string | null, values: Record<string, unknown>): Promise<EntityResult> {
  try {
    const user = await assertAdmin();
    const schema = entitySchemas[entity];
    const parsed = schema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Some fields need attention.", fields: fieldErrors(parsed.error) };
    const order = id ? undefined : await nextOrder(entity);
    let savedId = id ?? "";

    switch (entity) {
      case "capability": {
        const v = parsed.data as z.output<typeof entitySchemas.capability>;
        const clash = await prisma.capability.findFirst({ where: { slug: v.slug, ...(id ? { id: { not: id } } : {}) } });
        if (clash) return { ok: false, error: "That slug is taken.", fields: { slug: "Another capability uses this slug." } };
        const data = { ...v, deliverables: v.deliverables };
        savedId = id ? (await prisma.capability.update({ where: { id }, data })).id : (await prisma.capability.create({ data: { ...data, order: order! } })).id;
        break;
      }
      case "testimonial": {
        const v = parsed.data as z.output<typeof entitySchemas.testimonial>;
        savedId = id ? (await prisma.testimonial.update({ where: { id }, data: v })).id : (await prisma.testimonial.create({ data: { ...v, order: order! } })).id;
        break;
      }
      case "processStep": {
        const v = parsed.data as z.output<typeof entitySchemas.processStep>;
        savedId = id ? (await prisma.processStep.update({ where: { id }, data: v })).id : (await prisma.processStep.create({ data: { ...v, order: order! } })).id;
        break;
      }
      case "faq": {
        const v = parsed.data as z.output<typeof entitySchemas.faq>;
        const data = { question: v.question, answer: doc(v.answerText), group: v.group, status: v.status };
        savedId = id ? (await prisma.faq.update({ where: { id }, data })).id : (await prisma.faq.create({ data: { ...data, order: order! } })).id;
        break;
      }
      case "teamMember": {
        const v = parsed.data as z.output<typeof entitySchemas.teamMember>;
        savedId = id ? (await prisma.teamMember.update({ where: { id }, data: v })).id : (await prisma.teamMember.create({ data: { ...v, order: order! } })).id;
        break;
      }
      case "stat": {
        const v = parsed.data as z.output<typeof entitySchemas.stat>;
        savedId = id ? (await prisma.stat.update({ where: { id }, data: v })).id : (await prisma.stat.create({ data: { ...v, order: order! } })).id;
        break;
      }
      case "category": {
        const v = parsed.data as z.output<typeof entitySchemas.category>;
        const clash = await prisma.category.findFirst({ where: { slug: v.slug, ...(id ? { id: { not: id } } : {}) } });
        if (clash) return { ok: false, error: "That slug is taken.", fields: { slug: "Another type uses this slug." } };
        savedId = id ? (await prisma.category.update({ where: { id }, data: v })).id : (await prisma.category.create({ data: { ...v, order: order! } })).id;
        break;
      }
    }

    await logAudit({ userId: user.id, action: id ? `${entity}.save` : `${entity}.create`, entity: meta[entity].label, entityId: savedId });
    bust(entity);
    return { ok: true, id: savedId };
  } catch (error) {
    console.error("saveEntity", entity, error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function deleteEntity(entity: EntityName, id: string): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    switch (entity) {
      case "capability": await prisma.capability.delete({ where: { id } }); break;
      case "testimonial": await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date(), status: "DRAFT", featured: false } }); break;
      case "processStep": await prisma.processStep.delete({ where: { id } }); break;
      case "faq": await prisma.faq.delete({ where: { id } }); break;
      case "teamMember": await prisma.teamMember.delete({ where: { id } }); break;
      case "stat": await prisma.stat.delete({ where: { id } }); break;
      case "category": {
        const used = await prisma.project.count({ where: { categoryId: id, deletedAt: null } });
        if (used > 0) return { ok: false, error: `Can't delete: ${used} ${used === 1 ? "project uses" : "projects use"} this type. Change their type first.` };
        await prisma.category.delete({ where: { id } });
        break;
      }
    }
    await logAudit({ userId: user.id, action: `${entity}.delete`, entity: meta[entity].label, entityId: id });
    bust(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete." };
  }
}

export async function reorderEntity(entity: EntityName, ids: string[]): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    const ops = ids.map((id, i) => {
      const data = { order: i + 1 };
      switch (entity) {
        case "capability": return prisma.capability.update({ where: { id }, data });
        case "testimonial": return prisma.testimonial.update({ where: { id }, data });
        case "processStep": return prisma.processStep.update({ where: { id }, data });
        case "faq": return prisma.faq.update({ where: { id }, data });
        case "teamMember": return prisma.teamMember.update({ where: { id }, data });
        case "stat": return prisma.stat.update({ where: { id }, data });
        case "category": return prisma.category.update({ where: { id }, data });
      }
    });
    await prisma.$transaction(ops);
    await logAudit({ userId: user.id, action: `${entity}.reorder`, entity: meta[entity].label, diff: { ids } });
    bust(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not reorder." };
  }
}

/** Boolean toggles: featured on testimonials, status flips elsewhere. */
export async function toggleEntity(entity: EntityName, id: string, field: "featured" | "status", value: boolean): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    const status = value ? "PUBLISHED" : "DRAFT";
    if (field === "featured") {
      if (entity !== "testimonial") return { ok: false, error: "Only testimonials can be featured." };
      await prisma.testimonial.update({ where: { id }, data: { featured: value } });
    } else {
      switch (entity) {
        case "capability": await prisma.capability.update({ where: { id }, data: { status } }); break;
        case "testimonial": await prisma.testimonial.update({ where: { id }, data: { status } }); break;
        case "processStep": await prisma.processStep.update({ where: { id }, data: { status } }); break;
        case "faq": await prisma.faq.update({ where: { id }, data: { status } }); break;
        case "teamMember": await prisma.teamMember.update({ where: { id }, data: { status } }); break;
        case "stat": await prisma.stat.update({ where: { id }, data: { status } }); break;
        case "category": return { ok: false, error: "Types have no draft state." };
      }
    }
    await logAudit({ userId: user.id, action: `${entity}.${field}`, entity: meta[entity].label, entityId: id, diff: { [field]: value } });
    bust(entity);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update." };
  }
}

// ---- Content blocks ---------------------------------------------------

export async function saveContentGroup(group: string, entries: { key: string; value: string }[]): Promise<SimpleResult> {
  try {
    const user = await assertAdmin();
    const parsed = z.array(contentEntrySchema).safeParse(entries);
    if (!parsed.success) return { ok: false, error: "A value is too long or a key is missing." };
    await prisma.$transaction(parsed.data.map((e) => prisma.contentBlock.update({ where: { key: e.key }, data: { value: e.value } })));
    await logAudit({ userId: user.id, action: "content.save", entity: "ContentBlock", entityId: group, diff: { keys: parsed.data.map((e) => e.key) } });
    revalidateTag(CACHE_TAGS.content);
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

// ---- Settings ---------------------------------------------------------

export async function saveSettings(values: Record<string, unknown>): Promise<EntityResult> {
  try {
    const user = await assertAdmin();
    const parsed = settingsSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: "Some fields need attention.", fields: fieldErrors(parsed.error) };
    const { socialsGithub, socialsLinkedin, socialsX, ...rest } = parsed.data;
    const socials: Record<string, string> = {};
    if (socialsGithub) socials.github = socialsGithub;
    if (socialsLinkedin) socials.linkedin = socialsLinkedin;
    if (socialsX) socials.x = socialsX;
    await prisma.siteSettings.update({ where: { id: "default" }, data: { ...rest, socials } });
    await logAudit({ userId: user.id, action: "settings.save", entity: "SiteSettings", entityId: "default" });
    revalidateTag(CACHE_TAGS.settings);
    revalidatePath("/admin/settings");
    return { ok: true, id: "default" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function slugFor(text: string): Promise<string> {
  return slugify(text);
}
