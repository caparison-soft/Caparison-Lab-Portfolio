import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getCaseStudy } from "@/lib/queries/work";
import { getBlocks, getSettings, t } from "@/lib/queries/content";
import { formatBudget, formatDuration } from "@/lib/format";

export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function font(file: string): Promise<ArrayBuffer> {
  const res = await fetch(`${SITE}/fonts/og/${file}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Font ${file} not found`);
  return res.arrayBuffer();
}

/** The hex mark, drawn inline for the OG renderer. Same geometry and 135° gradient as the site. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D6F631" />
          <stop offset="0.46" stopColor="#8EA320" />
          <stop offset="1" stopColor="#171B06" />
        </linearGradient>
      </defs>
      <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="url(#g)" stroke="url(#g)" strokeWidth="9" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="23.5" fill="#ECEEE8" />
      <path d="M50 31 C52.2 43.5 56.5 47.8 69 50 C56.5 52.2 52.2 56.5 50 69 C47.8 56.5 43.5 52.2 31 50 C43.5 47.8 47.8 43.5 50 31 Z" fill="#D6F631" />
    </svg>
  );
}

/**
 * Social image, 1200 by 630. Brand tokens only: bone ground, ink type, the
 * mark bleeding off the right edge, data in mono. "site" renders the default.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [settings, blocks, black, regular, mono] = await Promise.all([
    getSettings(),
    getBlocks(["SEO", "Homepage"]),
    font("Satoshi-Black.otf"),
    font("Satoshi-Regular.otf"),
    font("JetBrainsMono-Regular.ttf"),
  ]);

  let title = settings.metaTitle ?? t(blocks, "meta.defaultTitle");
  let sub = settings.metaDescription ?? t(blocks, "meta.defaultDescription");
  let data: string[] = [];
  let marker = settings.siteName.toLowerCase();

  if (slug !== "site") {
    const p = await getCaseStudy(slug);
    if (!p) return new Response("Not found", { status: 404 });
    title = p.title;
    sub = p.summary;
    marker = `work / ${p.slug}`;
    data = [p.clientName, formatBudget(p), formatDuration(p, "long"), p.year ? String(p.year) : null].filter((x): x is string => Boolean(x));
  }

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: "#ECEEE8", color: "#000000", fontFamily: "Satoshi", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -190, top: 60, display: "flex" }}>
          <Mark size={560} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 820, height: "100%" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#5A6152" }}>{marker}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: title.length > 40 ? 60 : 76, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.98 }}>{title}</div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "#5A6152", maxWidth: 700 }}>{sub}</div>
          </div>
          <div style={{ display: "flex", gap: 32, fontFamily: "JetBrains Mono", fontSize: 24, color: "#000000" }}>
            {data.length > 0 ? data.map((d, i) => <div key={i} style={{ display: "flex" }}>{d}</div>) : <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 12, height: 12, borderRadius: 999, background: "#D6F631" }} />{settings.availabilityNote ?? ""}</div>}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Satoshi", data: black, weight: 900, style: "normal" },
        { name: "Satoshi", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
      headers: { "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
