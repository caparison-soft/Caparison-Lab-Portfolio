import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./content";
import type { IndexProject } from "./home";

// ---- Index ------------------------------------------------------------

export type WorkFilters = { category?: string; stack?: string };

const indexSelect = {
  id: true, slug: true, title: true, summary: true, clientName: true,
  budgetMin: true, budgetMax: true, budgetCurrency: true, budgetDisplay: true,
  durationValue: true, durationUnit: true, durationDisplay: true, year: true,
  category: { select: { name: true, slug: true } },
  cover: { select: { keyPrefix: true, alt: true, width: true, height: true, blurDataUrl: true, variants: true } },
  tags: { select: { tag: { select: { name: true, kind: true, order: true } } } },
} as const;

export const getProjectIndex = unstable_cache(
  async (filters: WorkFilters): Promise<IndexProject[]> => {
    const rows = await prisma.project.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.stack ? { tags: { some: { tag: { slug: filters.stack, kind: "STACK" } } } } : {}),
      },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      select: indexSelect,
    });
    return rows.map((r) => {
      const { tags, cover, ...rest } = r;
      return {
        ...rest,
        stack: tags.filter((x) => x.tag.kind === "STACK").sort((a, b) => a.tag.order - b.tag.order).map((x) => x.tag.name),
        cover: cover ? { ...cover, variants: (cover.variants as Record<string, string> | null) ?? null } : null,
      };
    });
  },
  ["project-index"],
  { tags: [CACHE_TAGS.projects] },
);

export type FilterOption = { slug: string; name: string; count: number };

/** Categories and stack tags that at least one published project uses, with counts. */
export const getWorkFilters = unstable_cache(
  async (): Promise<{ categories: FilterOption[]; stack: FilterOption[] }> => {
    const projects = await prisma.project.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { category: { select: { slug: true, name: true, order: true } }, tags: { select: { tag: { select: { slug: true, name: true, kind: true, order: true } } } } },
    });
    const cat = new Map<string, FilterOption & { order: number }>();
    const stack = new Map<string, FilterOption & { order: number }>();
    for (const p of projects) {
      if (p.category) {
        const c = cat.get(p.category.slug) ?? { slug: p.category.slug, name: p.category.name, count: 0, order: p.category.order };
        c.count++;
        cat.set(c.slug, c);
      }
      for (const { tag } of p.tags) {
        if (tag.kind !== "STACK") continue;
        const s = stack.get(tag.slug) ?? { slug: tag.slug, name: tag.name, count: 0, order: tag.order };
        s.count++;
        stack.set(s.slug, s);
      }
    }
    const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;
    const strip = (x: FilterOption & { order: number }): FilterOption => ({ slug: x.slug, name: x.name, count: x.count });
    return {
      categories: Array.from(cat.values()).sort(byOrder).map(strip),
      stack: Array.from(stack.values()).sort(byOrder).map(strip),
    };
  },
  ["work-filters"],
  { tags: [CACHE_TAGS.projects] },
);

// ---- Case study -------------------------------------------------------

export type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  keyPrefix: string;
  posterKey: string | null;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  variants: Record<string, string> | null;
  order: number;
};

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: unknown;
  clientName: string | null;
  year: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  budgetDisplay: string | null;
  durationValue: number | null;
  durationUnit: "DAYS" | "WEEKS" | "MONTHS";
  durationDisplay: string | null;
  teamSize: number | null;
  liveUrl: string | null;
  videoUrl: string | null;
  videoProvider: "R2" | "YOUTUBE" | "VIMEO";
  ctaMode: "ENQUIRY" | "EXTERNAL" | "NONE";
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string; slug: string } | null;
  stack: string[];
  cover: MediaItem | null;
  media: MediaItem[];
  metrics: { label: string; value: string; note: string | null }[];
  next: { slug: string; title: string } | null;
};

function toMedia(m: {
  id: string; type: "IMAGE" | "VIDEO"; keyPrefix: string; posterKey: string | null; alt: string | null; caption: string | null;
  width: number | null; height: number | null; blurDataUrl: string | null; variants: unknown; order: number;
}): MediaItem {
  return { ...m, variants: (m.variants as Record<string, string> | null) ?? null };
}

const mediaSelect = { id: true, type: true, keyPrefix: true, posterKey: true, alt: true, caption: true, width: true, height: true, blurDataUrl: true, variants: true, order: true } as const;

export const getCaseStudy = unstable_cache(
  async (slug: string): Promise<CaseStudy | null> => {
    const p = await prisma.project.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: {
        id: true, slug: true, title: true, summary: true, body: true, clientName: true, year: true,
        budgetMin: true, budgetMax: true, budgetCurrency: true, budgetDisplay: true,
        durationValue: true, durationUnit: true, durationDisplay: true, teamSize: true,
        liveUrl: true, videoUrl: true, videoProvider: true,
        ctaMode: true, ctaLabel: true, ctaHref: true, ctaNote: true,
        metaTitle: true, metaDescription: true, ogImageUrl: true, publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        cover: { select: mediaSelect },
        media: { select: mediaSelect, orderBy: { order: "asc" } },
        metrics: { select: { label: true, value: true, note: true }, orderBy: { order: "asc" } },
        tags: { select: { tag: { select: { name: true, kind: true, order: true } } } },
      },
    });
    if (!p) return null;
    const order = await prisma.project.findUniqueOrThrow({ where: { id: p.id }, select: { order: true } });

    const next =
      (await prisma.project.findFirst({
        where: { status: "PUBLISHED", deletedAt: null, id: { not: p.id }, order: { gt: order.order } },
        orderBy: { order: "asc" },
        select: { slug: true, title: true },
      })) ??
      (await prisma.project.findFirst({
        where: { status: "PUBLISHED", deletedAt: null, id: { not: p.id } },
        orderBy: { order: "asc" },
        select: { slug: true, title: true },
      }));

    const { tags, cover, media, publishedAt, updatedAt, ...rest } = p;
    return {
      ...rest,
      publishedAt: publishedAt ? publishedAt.toISOString() : null,
      updatedAt: updatedAt.toISOString(),
      stack: tags.filter((x) => x.tag.kind === "STACK").sort((a, b) => a.tag.order - b.tag.order).map((x) => x.tag.name),
      cover: cover ? toMedia(cover) : null,
      media: media.filter((m) => m.id !== cover?.id).map(toMedia),
      next,
    };
  },
  ["case-study"],
  { tags: [CACHE_TAGS.projects] },
);

export const getPublishedSlugs = unstable_cache(
  async (): Promise<string[]> =>
    (await prisma.project.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true } })).map((p) => p.slug),
  ["published-slugs"],
  { tags: [CACHE_TAGS.projects] },
);
