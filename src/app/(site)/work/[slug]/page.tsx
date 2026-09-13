import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/site/case-study-view";
import { getBlocks } from "@/lib/queries/content";
import { getCaseStudy, getPublishedSlugs } from "@/lib/queries/work";
import { JsonLd } from "@/components/site/json-ld";
import { imageSrcSet } from "@/lib/media";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getCaseStudy(slug);
  if (!p) return {};
  const image = p.ogImageUrl ?? `${SITE}/api/og/${p.slug}`;
  return {
    title: p.metaTitle ?? p.title,
    description: p.metaDescription ?? p.summary,
    alternates: { canonical: `${SITE}/work/${p.slug}` },
    openGraph: { title: p.metaTitle ?? p.title, description: p.metaDescription ?? p.summary, type: "article", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, blocks] = await Promise.all([getCaseStudy(slug), getBlocks(["Case study", "Homepage"])]);
  if (!p) notFound();
  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    url: `${SITE}/work/${p.slug}`,
    ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
    dateModified: p.updatedAt,
    ...(p.cover ? { image: imageSrcSet(p.cover.keyPrefix, p.cover.variants).src } : {}),
    ...(p.clientName ? { sourceOrganization: { "@type": "Organization", name: p.clientName } } : {}),
    creator: { "@type": "Organization", name: "Caparison Lab", url: SITE },
    keywords: p.stack.join(", "),
  };
  return (
    <>
      <JsonLd data={creativeWork} />
      <CaseStudyView p={p} blocks={blocks} />
    </>
  );
}
