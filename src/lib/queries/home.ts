import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./content";

/** Plain DTOs (no Dates) so results survive the cache round-trip unchanged. */

export type IndexProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  clientName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  budgetDisplay: string | null;
  durationValue: number | null;
  durationUnit: "DAYS" | "WEEKS" | "MONTHS";
  durationDisplay: string | null;
  year: number | null;
  stack: string[];
  category: { name: string; slug: string } | null;
  cover: { keyPrefix: string; alt: string | null; width: number | null; height: number | null; blurDataUrl: string | null; variants: Record<string, string> | null } | null;
};

const indexSelect = {
  id: true, slug: true, title: true, summary: true, clientName: true,
  budgetMin: true, budgetMax: true, budgetCurrency: true, budgetDisplay: true,
  durationValue: true, durationUnit: true, durationDisplay: true, year: true,
  category: { select: { name: true, slug: true } },
  cover: { select: { keyPrefix: true, alt: true, width: true, height: true, blurDataUrl: true, variants: true } },
  tags: { select: { tag: { select: { name: true, kind: true, order: true } } } },
} as const;

type Row = {
  id: string; slug: string; title: string; summary: string; clientName: string | null;
  budgetMin: number | null; budgetMax: number | null; budgetCurrency: string; budgetDisplay: string | null;
  durationValue: number | null; durationUnit: "DAYS" | "WEEKS" | "MONTHS"; durationDisplay: string | null; year: number | null;
  category: { name: string; slug: string } | null;
  cover: { keyPrefix: string; alt: string | null; width: number | null; height: number | null; blurDataUrl: string | null; variants: unknown } | null;
  tags: { tag: { name: string; kind: "STACK" | "INDUSTRY" | "SERVICE"; order: number } }[];
};

function toIndexProject(r: Row): IndexProject {
  const { tags, cover, ...rest } = r;
  return {
    ...rest,
    stack: tags.filter((x) => x.tag.kind === "STACK").sort((a, b) => a.tag.order - b.tag.order).map((x) => x.tag.name),
    cover: cover ? { ...cover, variants: (cover.variants as Record<string, string> | null) ?? null } : null,
  };
}

export const getFeaturedProjects = unstable_cache(
  async (limit = 5): Promise<IndexProject[]> => {
    const rows = await prisma.project.findMany({
      where: { status: "PUBLISHED", deletedAt: null, featured: true },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      take: limit,
      select: indexSelect,
    });
    return rows.map(toIndexProject);
  },
  ["featured-projects"],
  { tags: [CACHE_TAGS.projects] },
);

export const getPublishedProjectCount = unstable_cache(
  async (): Promise<number> => prisma.project.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ["published-project-count"],
  { tags: [CACHE_TAGS.projects] },
);

export type LiveProject = { slug: string; title: string; stack: string[]; buildNote: string | null };

/** The project flagged as currently building, any status. Admin opted in explicitly. */
export const getLiveProject = unstable_cache(
  async (): Promise<LiveProject | null> => {
    const r = await prisma.project.findFirst({
      where: { currentlyBuilding: true, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, title: true, buildNote: true, tags: { select: { tag: { select: { name: true, kind: true, order: true } } } } },
    });
    if (!r) return null;
    return {
      slug: r.slug,
      title: r.title,
      buildNote: r.buildNote,
      stack: r.tags.filter((x) => x.tag.kind === "STACK").sort((a, b) => a.tag.order - b.tag.order).map((x) => x.tag.name).slice(0, 4),
    };
  },
  ["live-project"],
  { tags: [CACHE_TAGS.projects] },
);

export type CapabilityItem = {
  slug: string; title: string; blurb: string; startingPrice: string | null; typicalTimeline: string | null;
  deliverables: string[]; weight: number;
  image: { keyPrefix: string; alt: string | null; width: number | null; height: number | null; blurDataUrl: string | null; variants: Record<string, string> | null } | null;
};

export const getCapabilities = unstable_cache(
  async (): Promise<CapabilityItem[]> =>
    (await prisma.capability.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { slug: true, title: true, blurb: true, startingPrice: true, typicalTimeline: true, deliverables: true, weight: true, image: { select: { keyPrefix: true, alt: true, width: true, height: true, blurDataUrl: true, variants: true } } },
    })).map((c) => ({ ...c, image: c.image ? { ...c.image, variants: (c.image.variants as Record<string, string> | null) ?? null } : null })),
  ["capabilities"],
  { tags: [CACHE_TAGS.capabilities] },
);

export type ProcessItem = { title: string; description: string; duration: string | null; order: number };

export const getProcessSteps = unstable_cache(
  async (): Promise<ProcessItem[]> =>
    prisma.processStep.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { title: true, description: true, duration: true, order: true },
    }),
  ["process-steps"],
  { tags: [CACHE_TAGS.process] },
);

export type TestimonialItem = { id: string; quote: string; authorName: string; authorRole: string | null; company: string | null; projectSlug: string | null };

export const getTestimonials = unstable_cache(
  async (): Promise<{ featured: TestimonialItem[]; companies: string[] }> => {
    const rows = await prisma.testimonial.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, quote: true, authorName: true, authorRole: true, company: true, featured: true, project: { select: { slug: true } } },
    });
    const all = rows.map((r) => ({ id: r.id, quote: r.quote, authorName: r.authorName, authorRole: r.authorRole, company: r.company, projectSlug: r.project?.slug ?? null, featured: r.featured }));
    const featured = all.filter((r) => r.featured);
    const companies = Array.from(new Set(all.map((r) => r.company).filter((c): c is string => Boolean(c))));
    return { featured: featured.length > 0 ? featured : all.slice(0, 3), companies };
  },
  ["testimonials"],
  { tags: [CACHE_TAGS.testimonials] },
);

export type ProjectOption = { slug: string; title: string };

/** For the "Regarding" line on the enquiry form when opened from a case study. */
export const getProjectBySlugForForm = unstable_cache(
  async (slug: string): Promise<ProjectOption | null> =>
    prisma.project.findFirst({ where: { slug, status: "PUBLISHED", deletedAt: null }, select: { slug: true, title: true } }),
  ["project-for-form"],
  { tags: [CACHE_TAGS.projects] },
);
