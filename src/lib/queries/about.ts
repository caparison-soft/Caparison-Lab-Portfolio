import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "./content";

export type TeamItem = { name: string; role: string; bio: string | null; avatarUrl: string | null };
export type StatItem = { label: string; value: string; note: string | null };
export type FaqItem = { question: string; answer: unknown };

export const getTeam = unstable_cache(
  async (): Promise<TeamItem[]> =>
    prisma.teamMember.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { name: true, role: true, bio: true, avatarUrl: true } }),
  ["team"],
  { tags: [CACHE_TAGS.team] },
);

export const getStats = unstable_cache(
  async (): Promise<StatItem[]> =>
    prisma.stat.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { label: true, value: true, note: true } }),
  ["stats"],
  { tags: [CACHE_TAGS.stats] },
);

export const getFaqs = unstable_cache(
  async (): Promise<FaqItem[]> =>
    prisma.faq.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { question: true, answer: true } }),
  ["faqs"],
  { tags: [CACHE_TAGS.faqs] },
);
