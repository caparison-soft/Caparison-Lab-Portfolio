import Link from "next/link";
import { Button } from "@/components/ui";
import { HexMark } from "@/components/site/hex-mark";
import { NavScroll } from "@/components/site/nav-scroll";
import { NavNotch, NavSheet, type NavMenuItem, type NavMenuProps } from "@/components/site/nav-menu";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { getCapabilities, getFeaturedProjects } from "@/lib/queries/home";
import { formatBudget, formatDuration } from "@/lib/format";

type NavProps = { blocks: Blocks; siteName: string };

/**
 * No bar: the header is fixed and transparent, laid over the page (the hero
 * runs under it). Wordmark left, the notch
 * (an ink tab hanging from the top edge with the links and two panels)
 * centred, the primary action right. NavScroll flags the ground under the
 * header (dark or light) so the wordmark and the sheet toggle invert, and
 * past 64px of scroll the wordmark becomes the hex mark (.site-nav in
 * globals.css). Under lg the links live in a sheet.
 */
export async function Nav({ blocks, siteName }: NavProps) {
  const [projects, capabilities] = await Promise.all([getFeaturedProjects(4), getCapabilities()]);

  const items: NavMenuItem[] = [
    { href: "/work", label: t(blocks, "nav.work"), panel: "work" },
    { href: "/capabilities", label: t(blocks, "nav.capabilities"), panel: "capabilities" },
    { href: "/about", label: t(blocks, "nav.about") },
    { href: "/contact", label: t(blocks, "nav.contact") },
  ];
  const menu: NavMenuProps = {
    items,
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      client: p.clientName,
      meta: [formatBudget(p), formatDuration(p)].filter((x): x is string => !!x),
    })),
    capabilities: capabilities.slice(0, 4).map((c) => ({ slug: c.slug, title: c.title, blurb: c.blurb })),
    labels: {
      workAll: t(blocks, "nav.workAll"),
      capabilitiesAll: t(blocks, "nav.capabilitiesAll"),
      cta: t(blocks, "home.hero.ctaPrimary"),
      menuOpen: t(blocks, "nav.menuOpen"),
      menuClose: t(blocks, "nav.menuClose"),
    },
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <NavScroll />
      <div className="site-nav px-3 md:px-[48px]">
        <div className="max-w-layout mx-auto h-full relative flex items-center gap-4">
          <Link href="/" className="flex items-center no-underline flex-none" aria-label={siteName}>
            <img src="/brand/wordmark-bone.png" alt="" width={384} height={102} className="nav-wordmark nav-wordmark-bone w-[120px] h-[32px] object-contain" />
            <img src="/brand/wordmark-ink.png" alt="" width={384} height={102} className="nav-wordmark nav-wordmark-ink w-[120px] h-[32px] object-contain" />
            <HexMark className="nav-icon w-[28px] h-[28px]" />
          </Link>

          <NavNotch {...menu} />

          <div className="hidden lg:block flex-none ml-auto">
            <Button size="sm" href="/contact">{menu.labels.cta}</Button>
          </div>

          <NavSheet {...menu} />
        </div>
      </div>
    </header>
  );
}
