import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ViewTransitions } from "@/components/site/view-transitions";
import { JsonLd } from "@/components/site/json-ld";
import { Intro } from "@/components/site/intro";
import { ChatSlot } from "@/components/site/chat/chat-slot";
import { PrefetchRoutes } from "@/components/site/prefetch-routes";
import { SiteMotion } from "@/components/motion/site-motion";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ScrollProgress } from "@/components/motion/scroll-progress";
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
    // Only when the owner has set one: otherwise app/icon.svg (adaptive) and
    // app/favicon.ico (the legacy fallback) are the icons, by file convention.
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
    robots: { index: true, follow: true },
  };
}

const BOOT = [
  "(function(){var h=document.documentElement;h.setAttribute('data-js','');",
  "try{if(location.pathname==='/'&&!sessionStorage.getItem('cl-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)h.setAttribute('data-intro','')}catch(e){}",
  // Should hydration never arrive, show everything rather than a blank page.
  "setTimeout(function(){if(!h.hasAttribute('data-reveal-ready')){h.removeAttribute('data-js');h.removeAttribute('data-intro')}},5000)})()",
].join("");

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["Navigation", "Footer", "Errors", "Homepage"])]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: SITE,
    logo: `${SITE}/brand/icon.png`,
    email: settings.email,
    // No telephone: the number is not published anywhere on the site (owner, 2026-09-15).
    ...(settings.location ? { address: { "@type": "PostalAddress", addressLocality: settings.location } } : {}),
    sameAs: Object.values(settings.socials),
  };

  // One-page site (owner's boss, 2026-11-07): the links are sections of the
  // home page. About, Home services and Contact are reached from the footer.
  const links = [
    { href: "/", label: t(blocks, "nav.home") },
    { href: "/#services", label: t(blocks, "nav.services") },
    { href: "/#work", label: t(blocks, "nav.work") },
    { href: "/#pricing", label: t(blocks, "nav.pricing") },
  ];

  return (
    <ButtonStyleProvider value="plain">
      <SiteMotion>
        <JsonLd data={organization} />
        {/* data-js gates the reveal states; data-intro holds them under the first-visit intro. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <Intro />
        <a href="#main" className="skip-link">{t(blocks, "nav.skipToContent")}</a>
        <SiteHeader
          siteName={settings.siteName}
          links={links}
          cta={{ href: "/#contact", label: t(blocks, "nav.cta") }}
          labels={{ menuOpen: t(blocks, "nav.menuOpen"), menuClose: t(blocks, "nav.menuClose"), email: settings.email }}
          email={settings.email}
        />
        <ScrollProgress />
        <div className="site-light">
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
          <SiteFooter blocks={blocks} settings={settings} />
        </div>
        <PrefetchRoutes hrefs={["/", "/#contact", "/about"]} />
        <ChatSlot />
        <SmoothScroll />
        <RevealObserver />
        {settings.analyticsEnabled && settings.gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.gaId)}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.gaId.replace(/[^A-Za-z0-9_-]/g, "")}',{anonymize_ip:true});`}</Script>
          </>
        ) : null}
      </SiteMotion>
    </ButtonStyleProvider>
  );
}
