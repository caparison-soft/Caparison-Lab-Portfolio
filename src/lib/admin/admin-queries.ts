import "server-only";
import { prisma } from "@/lib/db";
import type { ProjectInput } from "@/lib/admin/schemas";

export type ProjectListRow = {
  id: string; title: string; slug: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; featured: boolean; order: number;
  updatedAt: string; category: { id: string; name: string } | null; coverUrl: string | null; currentlyBuilding: boolean;
};

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");

export async function getProjectList(): Promise<{ rows: ProjectListRow[]; categories: { id: string; name: string }[] }> {
  const [rows, categories] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
      select: { id: true, title: true, slug: true, status: true, featured: true, order: true, updatedAt: true, currentlyBuilding: true, category: { select: { id: true, name: true } }, cover: { select: { keyPrefix: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  return {
    rows: rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString(), coverUrl: r.cover ? `${cdn}/${r.cover.keyPrefix}/w400.webp` : null, cover: undefined })),
    categories,
  };
}

export type EditorData = {
  id: string;
  values: ProjectInput;
  slug: string;
  updatedAt: string;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string; kind: "STACK" | "INDUSTRY" | "SERVICE" }[];
  media: { id: string; type: "IMAGE" | "VIDEO"; keyPrefix: string; alt: string | null; width: number | null; height: number | null }[];
  coverImageId: string | null;
};

export async function getProjectForEditor(id: string): Promise<EditorData | null> {
  const p = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: { tags: { select: { tagId: true } }, metrics: { orderBy: { order: "asc" } }, media: { orderBy: { order: "asc" }, select: { id: true, type: true, keyPrefix: true, alt: true, width: true, height: true } } },
  });
  if (!p) return null;
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }], select: { id: true, name: true, kind: true } }),
  ]);
  const s = (v: string | number | null | undefined) => (v == null ? "" : String(v));
  return {
    id: p.id,
    slug: p.slug,
    updatedAt: p.updatedAt.toISOString(),
    coverImageId: p.coverImageId,
    categories,
    tags,
    media: p.media,
    values: {
      title: p.title, slug: p.slug, summary: p.summary, body: p.body ?? undefined,
      categoryId: p.categoryId ?? "", tagIds: p.tags.map((t) => t.tagId),
      clientName: s(p.clientName), clientLogoUrl: s(p.clientLogoUrl), year: s(p.year), teamSize: s(p.teamSize), liveUrl: s(p.liveUrl), repoUrl: s(p.repoUrl),
      budgetMin: s(p.budgetMin), budgetMax: s(p.budgetMax), budgetCurrency: p.budgetCurrency, budgetDisplay: s(p.budgetDisplay),
      durationValue: s(p.durationValue), durationUnit: p.durationUnit, durationDisplay: s(p.durationDisplay),
      metrics: p.metrics.map((m) => ({ label: m.label, value: m.value, note: s(m.note) })),
      videoUrl: s(p.videoUrl), videoProvider: p.videoProvider,
      ctaMode: p.ctaMode, ctaLabel: s(p.ctaLabel), ctaHref: s(p.ctaHref), ctaNote: s(p.ctaNote),
      metaTitle: s(p.metaTitle), metaDescription: s(p.metaDescription), ogImageUrl: s(p.ogImageUrl),
      status: p.status, featured: p.featured, currentlyBuilding: p.currentlyBuilding, buildNote: s(p.buildNote),
      publishedAt: p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : "",
    },
  };
}

export type ContentGroup = { group: string; blocks: { key: string; label: string; helpText: string | null; type: string; value: string; defaultValue: string; order: number }[] };

export async function getContentGroups(): Promise<ContentGroup[]> {
  const rows = await prisma.contentBlock.findMany({ orderBy: [{ order: "asc" }] });
  const groups = new Map<string, ContentGroup>();
  for (const r of rows) {
    const g = groups.get(r.group) ?? { group: r.group, blocks: [] };
    g.blocks.push({ key: r.key, label: r.label, helpText: r.helpText, type: r.type, value: r.value ?? r.defaultValue ?? "", defaultValue: r.defaultValue ?? "", order: r.order });
    groups.set(r.group, g);
  }
  return Array.from(groups.values());
}

export type SimpleRow = { id: string; order: number; status: "DRAFT" | "PUBLISHED"; title: string; sub: string | null; values: Record<string, unknown>; featured?: boolean };

function plain(json: unknown): string {
  const d = json as { content?: { type: string; content?: { text?: string }[] }[] } | null;
  return (d?.content ?? []).filter((n) => n.type === "paragraph").map((n) => (n.content ?? []).map((t) => t.text ?? "").join("")).join("\n\n");
}

export async function getSimpleRows(entity: "capability" | "testimonial" | "processStep" | "faq" | "teamMember" | "stat"): Promise<SimpleRow[]> {
  switch (entity) {
    case "capability":
      return (await prisma.capability.findMany({ orderBy: { order: "asc" }, include: { image: { select: { keyPrefix: true } } } })).map((r) => ({ id: r.id, order: r.order, status: r.status, title: r.title, sub: `${r.startingPrice ?? ""} ${r.typicalTimeline ?? ""}`.trim() || null, values: { title: r.title, slug: r.slug, blurb: r.blurb, startingPrice: r.startingPrice ?? "", typicalTimeline: r.typicalTimeline ?? "", deliverables: r.deliverables, weight: String(r.weight), imageId: r.imageId ?? "", imageIdPreview: r.image ? `${cdn}/${r.image.keyPrefix}/w800.webp` : "", status: r.status } }));
    case "testimonial":
      return (await prisma.testimonial.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } })).map((r) => ({ id: r.id, order: r.order, status: r.status, featured: r.featured, title: r.authorName, sub: [r.authorRole, r.company].filter(Boolean).join(", ") || null, values: { quote: r.quote, authorName: r.authorName, authorRole: r.authorRole ?? "", company: r.company ?? "", avatarUrl: r.avatarUrl ?? "", companyLogoUrl: r.companyLogoUrl ?? "", projectId: r.projectId ?? "", featured: r.featured, status: r.status } }));
    case "processStep":
      return (await prisma.processStep.findMany({ orderBy: { order: "asc" } })).map((r) => ({ id: r.id, order: r.order, status: r.status, title: r.title, sub: r.duration, values: { title: r.title, duration: r.duration ?? "", description: r.description, status: r.status } }));
    case "faq":
      return (await prisma.faq.findMany({ orderBy: { order: "asc" } })).map((r) => ({ id: r.id, order: r.order, status: r.status, title: r.question, sub: r.group, values: { question: r.question, answerText: plain(r.answer), group: r.group ?? "", status: r.status } }));
    case "teamMember":
      return (await prisma.teamMember.findMany({ orderBy: { order: "asc" } })).map((r) => ({ id: r.id, order: r.order, status: r.status, title: r.name, sub: r.role, values: { name: r.name, role: r.role, bio: r.bio ?? "", avatarUrl: r.avatarUrl ?? "", status: r.status } }));
    case "stat":
      return (await prisma.stat.findMany({ orderBy: { order: "asc" } })).map((r) => ({ id: r.id, order: r.order, status: r.status, title: `${r.value} ${r.label}`, sub: r.note, values: { label: r.label, value: r.value, note: r.note ?? "", status: r.status } }));
  }
}

export async function getProjectOptions(): Promise<{ id: string; title: string }[]> {
  return prisma.project.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } });
}

export async function getSettingsForm(): Promise<Record<string, unknown>> {
  const s = await prisma.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
  const socials = (s.socials ?? {}) as Record<string, string>;
  return {
    siteName: s.siteName, email: s.email, phone: s.phone ?? "", whatsapp: s.whatsapp ?? "", location: s.location ?? "",
    availabilityStatus: s.availabilityStatus, availabilityNote: s.availabilityNote ?? "", bookingUrl: s.bookingUrl ?? "",
    socialsGithub: socials.github ?? "", socialsLinkedin: socials.linkedin ?? "", socialsX: socials.x ?? "",
    metaTitle: s.metaTitle ?? "", metaDescription: s.metaDescription ?? "", ogImageUrl: s.ogImageUrl ?? "", faviconUrl: s.faviconUrl ?? "",
    gaId: s.gaId ?? "", analyticsEnabled: s.analyticsEnabled, maintenanceMode: s.maintenanceMode,
  };
}
