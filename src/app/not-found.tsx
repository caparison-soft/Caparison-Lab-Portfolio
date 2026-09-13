import { Button, Section } from "@/components/ui";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { getBlocks, getSettings, t } from "@/lib/queries/content";

/**
 * Root 404 for unmatched URLs. Route-group not-found files only handle
 * notFound() calls inside the group, so this one carries the site chrome.
 */
export default async function RootNotFound() {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["Errors", "Navigation", "Footer", "Homepage"])]);
  return (
    <>
      <a href="#main" className="skip-link">{t(blocks, "nav.skipToContent")}</a>
      <Nav blocks={blocks} siteName={settings.siteName} />
      <main id="main">
        <Section pad="tall" innerClassName="min-h-[60svh] flex flex-col items-center justify-center text-center">
          <p className="data text-ash">404</p>
          <h1 className="mt-2 text-display-l">{t(blocks, "notFound.heading")}</h1>
          <p className="mt-3 text-body-l text-ash">{t(blocks, "notFound.body")}</p>
          <div className="mt-4">
            <Button href="/work">{t(blocks, "notFound.ctaLabel")}</Button>
          </div>
        </Section>
      </main>
      <Footer blocks={blocks} settings={settings} />
    </>
  );
}
