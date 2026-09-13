import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ViewTransitions } from "@/components/site/view-transitions";
import { JsonLd } from "@/components/site/json-ld";
import { ButtonStyleProvider, Section } from "@/components/ui";
import { getBlocks, getSettings, t } from "@/lib/queries/content";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["SEO"])]);
  const title = settings.metaTitle ?? t(blocks, "meta.defaultTitle");
  const description = settings.metaDescription ?? t(blocks, "meta.defaultDescription");
  const ogImage = settings.ogImageUrl ?? `${SITE}/api/og/site`;
  return {
    title: { default: title, template: `%s — ${t(blocks, "meta.titleSuffix")}` },
    description,
    metadataBase: new URL(SITE),
    alternates: { canonical: "./", types: { "application/rss+xml": `${SITE}/feed.xml` } },
    openGraph: { siteName: settings.siteName, title, description, type: "website", images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    icons: { icon: settings.faviconUrl ?? "/brand/icon.png" },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["Navigation", "Footer", "Errors", "Homepage"])]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: SITE,
    logo: `${SITE}/brand/icon.png`,
    email: settings.email,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.location ? { address: { "@type": "PostalAddress", addressLocality: settings.location } } : {}),
    sameAs: Object.values(settings.socials),
  };

  return (
    <ButtonStyleProvider value="metal">
      <JsonLd data={organization} />
      <a href="#main" className="skip-link">{t(blocks, "nav.skipToContent")}</a>
      <Nav blocks={blocks} siteName={settings.siteName} />
      {settings.maintenanceMode ? (
        <main id="main">
          <Section pad="tall" innerClassName="min-h-[60svh] flex flex-col items-start justify-center">
            <h1 className="text-display-l">{t(blocks, "maintenance.heading")}</h1>
            <p className="mt-3 text-body-l text-ash">{t(blocks, "maintenance.body")}</p>
          </Section>
        </main>
      ) : (
        <ViewTransitions>{children}</ViewTransitions>
      )}
      <Footer blocks={blocks} settings={settings} />
      {settings.analyticsEnabled && settings.gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.gaId)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.gaId.replace(/[^A-Za-z0-9_-]/g, "")}',{anonymize_ip:true});`}</Script>
        </>
      ) : null}
    </ButtonStyleProvider>
  );
}
