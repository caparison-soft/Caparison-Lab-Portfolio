import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/site/case-study-view";
import { getBlocks } from "@/lib/queries/content";
import { getCaseStudy, getPublishedSlugs } from "@/lib/queries/work";

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
  return {
    title: p.metaTitle ?? p.title,
    description: p.metaDescription ?? p.summary,
    openGraph: { title: p.metaTitle ?? p.title, description: p.metaDescription ?? p.summary, type: "article", ...(p.ogImageUrl ? { images: [p.ogImageUrl] } : {}) },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, blocks] = await Promise.all([getCaseStudy(slug), getBlocks(["Case study", "Homepage"])]);
  if (!p) notFound();
  return <CaseStudyView p={p} blocks={blocks} />;
}
