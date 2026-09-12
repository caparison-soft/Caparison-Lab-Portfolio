import type { Metadata } from "next";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ViewTransitions } from "@/components/site/view-transitions";
import { getBlocks, getSettings, t } from "@/lib/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["SEO"])]);
  const title = settings.metaTitle ?? t(blocks, "meta.defaultTitle");
  const description = settings.metaDescription ?? t(blocks, "meta.defaultDescription");
  return {
    title: { default: title, template: `%s — ${t(blocks, "meta.titleSuffix")}` },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: { siteName: settings.siteName, title, description, type: "website" },
    icons: { icon: "/brand/icon.png" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["Navigation", "Footer"])]);
  return (
    <>
      <a href="#main" className="skip-link">{t(blocks, "nav.skipToContent")}</a>
      <Nav blocks={blocks} siteName={settings.siteName} />
      <ViewTransitions>{children}</ViewTransitions>
      <Footer blocks={blocks} settings={settings} />
    </>
  );
}
