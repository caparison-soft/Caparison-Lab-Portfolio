import Link from "next/link";
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
 * Thin, left-aligned. Wordmark and four links. On phones the links live in
 * a <details> sheet: keyboard-operable with no client JavaScript.
 */
export function Nav({ blocks, siteName }: NavProps) {
  return (
    <header className="px-3 md:px-[48px] border-b border-divider-light bg-bone">
      <div className="max-w-layout mx-auto h-[56px] flex items-center gap-5">
        <Link href="/" className="flex items-center no-underline" aria-label={siteName}>
          <img src="/brand/wordmark-ink.png" alt="" width={761} height={203} className="w-[128px] h-auto" />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-3 list-none m-0 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-body font-medium text-ash hover:text-ink no-underline transition-colors dur-fast">
                  {t(blocks, l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="site-menu md:hidden ml-auto">
          <summary className="list-none cursor-pointer text-body font-medium text-ink select-none rounded-sm px-1 -mx-1">
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
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
