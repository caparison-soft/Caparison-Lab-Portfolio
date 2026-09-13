import { prisma } from "@/lib/db";
import { getBlocks, getSettings, t } from "@/lib/queries/content";
import { formatBudget, formatDuration } from "@/lib/format";

export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] ?? c);

/** RSS 2.0 of published work. */
export async function GET() {
  const [settings, blocks, projects] = await Promise.all([
    getSettings(),
    getBlocks(["SEO"]),
    prisma.project.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
      select: { slug: true, title: true, summary: true, publishedAt: true, updatedAt: true, clientName: true, budgetMin: true, budgetMax: true, budgetCurrency: true, budgetDisplay: true, durationValue: true, durationUnit: true, durationDisplay: true },
    }),
  ]);
  const items = projects
    .map((p) => {
      const meta = [p.clientName, formatBudget(p), formatDuration(p, "long")].filter(Boolean).join(", ");
      return `<item>
  <title>${esc(p.title)}</title>
  <link>${SITE}/work/${p.slug}</link>
  <guid isPermaLink="true">${SITE}/work/${p.slug}</guid>
  <pubDate>${(p.publishedAt ?? p.updatedAt).toUTCString()}</pubDate>
  <description>${esc(p.summary)}${meta ? esc(` (${meta})`) : ""}</description>
</item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(settings.siteName)}: work</title>
  <link>${SITE}/work</link>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
  <description>${esc(settings.metaDescription ?? t(blocks, "meta.defaultDescription"))}</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
