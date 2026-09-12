import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/site/case-study-view";
import { getBlocks } from "@/lib/queries/content";
import { getCaseStudyPreview } from "@/lib/queries/work";
import { verifyPreview } from "@/lib/preview";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** "Preview as visitor" for drafts. The token is an HMAC of the slug; no session needed, so the owner can share it. */
export default async function PreviewPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ token?: string }> }) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);
  if (!verifyPreview(slug, token)) notFound();
  const [p, blocks] = await Promise.all([getCaseStudyPreview(slug), getBlocks(["Case study", "Homepage"])]);
  if (!p) notFound();
  return <CaseStudyView p={p} blocks={blocks} preview />;
}
