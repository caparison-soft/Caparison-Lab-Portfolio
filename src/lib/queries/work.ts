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
  slot: "THUMBNAIL" | "HERO" | "GALLERY" | "VIDEO" | "STORY";
  title: string | null;
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
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  slug: string;
  title: string;
  summary: string;
  body: unknown;
  /** The story panel: two fields beside a picture, side chosen in the admin. */
  brief: unknown;
  whatWeBuilt: unknown;
  storyImage: MediaItem | null;
  storySide: "LEFT" | "RIGHT";
  clientName: string | null;
  clientLogoUrl: string | null;
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
  /** Thumbnail: the home card and index. */
  cover: MediaItem | null;
  /** Hero: image or video at the top of the case page. */
  hero: MediaItem | null;
  /** Gallery slides, in order. */
  media: MediaItem[];
  /** Videos section, in order. */
  videos: MediaItem[];
  metrics: { label: string; value: string; note: string | null; period: string | null; source: string | null }[];
  outcome: string | null;
  role: string | null;
  platforms: string[];
  stage: "LIVE" | "BETA" | "RETIRED" | null;
  launchedAt: string | null;
  afterNote: string | null;
  decisions: { title: string; reason: string }[];
  phases: { label: string; when: string; note: string | null }[];
  team: { name: string; role: string; avatarUrl: string | null }[];
  testimonials: { quote: string; authorName: string; authorRole: string | null; company: string | null; avatarUrl: string | null }[];
  next: { slug: string; title: string } | null;
};

function toMedia(m: {
  id: string; type: "IMAGE" | "VIDEO"; slot: "THUMBNAIL" | "HERO" | "GALLERY" | "VIDEO" | "STORY"; title: string | null; keyPrefix: string; posterKey: string | null; alt: string | null; caption: string | null;
  width: number | null; height: number | null; blurDataUrl: string | null; variants: unknown; order: number;
}): MediaItem {
  return { ...m, variants: (m.variants as Record<string, string> | null) ?? null };
}

const mediaSelect = { id: true, type: true, slot: true, title: true, keyPrefix: true, posterKey: true, alt: true, caption: true, width: true, height: true, blurDataUrl: true, variants: true, order: true } as const;

async function loadCaseStudy(slug: string, publishedOnly: boolean): Promise<CaseStudy | null> {
    const p = await prisma.project.findFirst({
      where: { slug, deletedAt: null, ...(publishedOnly ? { status: "PUBLISHED" } : {}) },
      select: {
        id: true, status: true, slug: true, title: true, summary: true, body: true, clientName: true, clientLogoUrl: true, year: true,
        brief: true, whatWeBuilt: true, storySide: true,
        budgetMin: true, budgetMax: true, budgetCurrency: true, budgetDisplay: true,
        durationValue: true, durationUnit: true, durationDisplay: true, teamSize: true,
        liveUrl: true, videoUrl: true, videoProvider: true,
        ctaMode: true, ctaLabel: true, ctaHref: true, ctaNote: true,
        metaTitle: true, metaDescription: true, ogImageUrl: true, publishedAt: true, updatedAt: true,
        outcome: true, role: true, platforms: true, stage: true, launchedAt: true, afterNote: true,
        decisions: { select: { title: true, reason: true }, orderBy: { order: "asc" } },
        phases: { select: { label: true, when: true, note: true }, orderBy: { order: "asc" } },
        team: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { name: true, role: true, avatarUrl: true } },
        testimonials: { where: { status: "PUBLISHED", deletedAt: null }, orderBy: { order: "asc" }, select: { quote: true, authorName: true, authorRole: true, company: true, avatarUrl: true } },
        category: { select: { name: true, slug: true } },
        cover: { select: mediaSelect },
        hero: { select: mediaSelect },
        storyImage: { select: mediaSelect },
        media: { select: mediaSelect, orderBy: { order: "asc" } },
        metrics: { select: { label: true, value: true, note: true, period: true, source: true }, orderBy: { order: "asc" } },
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

    const { tags, cover, hero, storyImage, media, publishedAt, updatedAt, launchedAt, ...rest } = p;
    return {
      ...rest,
      publishedAt: publishedAt ? publishedAt.toISOString() : null,
      launchedAt: launchedAt ? launchedAt.toISOString() : null,
      updatedAt: updatedAt.toISOString(),
      stack: tags.filter((x) => x.tag.kind === "STACK").sort((a, b) => a.tag.order - b.tag.order).map((x) => x.tag.name),
      cover: cover ? toMedia(cover) : null,
      hero: hero ? toMedia(hero) : null,
      storyImage: storyImage ? toMedia(storyImage) : null,
      storySide: (rest.storySide === "RIGHT" ? "RIGHT" : "LEFT") as "LEFT" | "RIGHT",
      media: media.filter((m) => m.slot === "GALLERY" && m.type === "IMAGE").map(toMedia),
      videos: media.filter((m) => m.slot === "VIDEO" && m.type === "VIDEO").map(toMedia),
      next,
    };
}

export const getCaseStudy = unstable_cache(async (slug: string) => loadCaseStudy(slug, true), ["case-study"], { tags: [CACHE_TAGS.projects] });

/** Uncached, any status. Only reachable through a signed preview link. */
export async function getCaseStudyPreview(slug: string): Promise<CaseStudy | null> {
  return loadCaseStudy(slug, false);
}

export const getPublishedSlugs = unstable_cache(
  async (): Promise<string[]> =>
    (await prisma.project.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true } })).map((p) => p.slug),
  ["published-slugs"],
  { tags: [CACHE_TAGS.projects] },
);
