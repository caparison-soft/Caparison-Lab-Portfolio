import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./content";

/** The concept project teased on an industry page. Null unless it is published. */
export type ConceptTeaser = {
  slug: string;
  title: string;
  summary: string;
  outcome: string | null;
  cover: { keyPrefix: string; alt: string | null; width: number | null; height: number | null; blurDataUrl: string | null; variants: Record<string, string> | null } | null;
};

export const getConceptTeaser = unstable_cache(
  async (slug: string): Promise<ConceptTeaser | null> => {
    const r = await prisma.project.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: {
        slug: true, title: true, summary: true, outcome: true,
        cover: { select: { keyPrefix: true, alt: true, width: true, height: true, blurDataUrl: true, variants: true } },
      },
    });
    if (!r) return null;
    return { ...r, cover: r.cover ? { ...r.cover, variants: (r.cover.variants as Record<string, string> | null) ?? null } : null };
  },
  ["concept-teaser"],
  { tags: [CACHE_TAGS.projects] },
);
