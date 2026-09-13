import Link from "next/link";
import { Button } from "@/components/ui";
import { HexMark } from "@/components/site/hex-mark";
import { NavScroll } from "@/components/site/nav-scroll";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";

type NavProps = { blocks: Blocks; siteName: string };

const links = [
  { href: "/work", key: "nav.work" },
  { href: "/capabilities", key: "nav.capabilities" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
] as const;

/**
 * Full-width dark bar, sticky at the top. Wordmark left, links centred, the
 * primary action right. Once the page scrolls it shrinks and the wordmark
 * becomes the hex mark (see .site-nav in globals.css). On phones the links
 * live in a <details> sheet with no client JavaScript.
 */
export function Nav({ blocks, siteName }: NavProps) {
  return (
    <header className="sticky top-0 z-50">
      <NavScroll />
      <div className="site-nav section-dark ground-ink on-dark px-3 md:px-[48px]">
        <div className="max-w-layout mx-auto h-full flex items-center gap-4">
          <Link href="/" className="flex items-center no-underline flex-none" aria-label={siteName}>
            <img src="/brand/wordmark-bone.png" alt="" width={384} height={102} className="nav-wordmark w-[120px] h-[32px] object-contain" />
            <HexMark className="nav-icon w-[28px] h-[28px]" />
          </Link>

          <nav aria-label="Primary" className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-5 list-none m-0 p-0">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-body font-medium text-sage hover:text-bone no-underline transition-colors dur-fast">
                    {t(blocks, l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block flex-none">
            <Button size="sm" href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
          </div>

          <details className="site-menu md:hidden ml-auto">
            <summary className="list-none cursor-pointer text-body font-medium text-bone select-none rounded-sm px-1 -mx-1">
              <span className="site-menu-open">{t(blocks, "nav.menuOpen")}</span>
              <span className="site-menu-close">{t(blocks, "nav.menuClose")}</span>
            </summary>
            <nav aria-label="Primary" className="site-menu-panel">
              <ul className="list-none m-0 p-0 flex flex-col">
                {links.map((l) => (
                  <li key={l.href} className="border-b border-divider-light">
                    <Link href={l.href} className="block py-2 text-h3 font-medium text-ink no-underline">
                      {t(blocks, l.key)}
                    </Link>
                  </li>
                ))}
                <li className="pt-3">
                  <Button href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
