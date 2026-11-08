import { ButtonStyleProvider } from "@/components/ui";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { NotFoundBody } from "@/components/site/not-found-body";
import { getBlocks, getSettings, t } from "@/lib/queries/content";

/**
 * Root 404 for unmatched URLs. Route-group not-found files only handle
 * notFound() calls inside the group, so this one carries the site chrome:
 * the same header, light ground and footer as the (site) layout.
 */
export default async function RootNotFound() {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks(["Errors", "Navigation", "Footer", "Homepage"])]);
  const links = [
    { href: "/#services", label: t(blocks, "nav.services") },
    { href: "/industries/home-services", label: t(blocks, "nav.homeServices") },
    { href: "/#work", label: t(blocks, "nav.work") },
    { href: "/about", label: t(blocks, "nav.about") },
    { href: "/#contact", label: t(blocks, "nav.contact") },
  ];
  return (
    <ButtonStyleProvider value="plain">
      <a href="#main" className="skip-link">{t(blocks, "nav.skipToContent")}</a>
      <SiteHeader
        siteName={settings.siteName}
        links={links}
        cta={{ href: "/#contact", label: t(blocks, "nav.cta") }}
        labels={{ menuOpen: t(blocks, "nav.menuOpen"), menuClose: t(blocks, "nav.menuClose"), email: settings.email }}
        email={settings.email}
      />
      <div className="site-light">
        <NotFoundBody blocks={blocks} />
        <SiteFooter blocks={blocks} settings={settings} />
      </div>
    </ButtonStyleProvider>
  );
}
