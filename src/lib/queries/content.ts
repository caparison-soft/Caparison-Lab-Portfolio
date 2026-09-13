import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const CACHE_TAGS = {
  content: "content",
  settings: "settings",
  projects: "projects",
  capabilities: "capabilities",
  process: "process",
  testimonials: "testimonials",
  stats: "stats",
  team: "team",
  faqs: "faqs",
} as const;

export type Blocks = Record<string, string>;

/**
 * Every public string. Fetched per group, cached, invalidated by tag on write.
 * A missing key returns the key itself so a typo is visible on the page, not silent.
 */
export const getBlocks = unstable_cache(
  async (groups: string[]): Promise<Blocks> => {
    const rows = await prisma.contentBlock.findMany({
      where: { group: { in: groups } },
      select: { key: true, value: true, defaultValue: true },
    });
    const out: Blocks = {};
    for (const r of rows) out[r.key] = r.value ?? r.defaultValue ?? r.key;
    return out;
  },
  ["content-blocks"],
  { tags: [CACHE_TAGS.content] },
);

/** Lookup with a visible fallback. */
export function t(blocks: Blocks, key: string): string {
  return blocks[key] ?? key;
}

/** One option per line, blank lines dropped. */
export function lines(value: string): string[] {
  return value.split("\n").map((s) => s.trim()).filter(Boolean);
}

export type Settings = {
  siteName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  availabilityStatus: "AVAILABLE" | "LIMITED" | "BOOKED";
  availabilityNote: string | null;
  bookingUrl: string | null;
  socials: Record<string, string>;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  analyticsEnabled: boolean;
  gaId: string | null;
  maintenanceMode: boolean;
};

export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!s) throw new Error("SiteSettings row 'default' is missing. Run the seed.");
    const socials = (s.socials ?? {}) as Record<string, string>;
    return {
      siteName: s.siteName,
      email: s.email,
      phone: s.phone,
      whatsapp: s.whatsapp,
      location: s.location,
      availabilityStatus: s.availabilityStatus,
      availabilityNote: s.availabilityNote,
      bookingUrl: s.bookingUrl,
      socials,
      metaTitle: s.metaTitle,
      metaDescription: s.metaDescription,
      ogImageUrl: s.ogImageUrl,
      faviconUrl: s.faviconUrl,
      analyticsEnabled: s.analyticsEnabled,
      gaId: s.gaId,
      maintenanceMode: s.maintenanceMode,
    };
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.settings] },
);
