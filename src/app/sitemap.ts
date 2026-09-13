import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true, updatedAt: true }, orderBy: { order: "asc" } });
  const latest = projects.reduce<Date | undefined>((m, p) => (!m || p.updatedAt > m ? p.updatedAt : m), undefined);
  return [
    { url: `${SITE}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/work`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/capabilities`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((p) => ({ url: `${SITE}/work/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
