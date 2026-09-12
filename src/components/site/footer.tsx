import Link from "next/link";
import type { Blocks, Settings } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";

type FooterProps = { blocks: Blocks; settings: Settings };

/** Dark, continuous with the contact block above it on the homepage. */
export function Footer({ blocks, settings }: FooterProps) {
  const year = new Date().getFullYear();
  const links = [
    { href: "/work", label: t(blocks, "nav.work") },
    { href: "/capabilities", label: t(blocks, "nav.capabilities") },
    { href: "/about", label: t(blocks, "nav.about") },
    { href: "/contact", label: t(blocks, "nav.contact") },
  ];
  return (
    <footer className="section-dark on-dark px-3 md:px-[48px] border-t border-olive-600">
      <div className="max-w-layout mx-auto py-4 grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 items-start">
        <Link href="/" className="no-underline" aria-label={settings.siteName}>
          <img src="/brand/wordmark-bone.png" alt="" width={761} height={203} className="w-[112px] h-auto" />
        </Link>
        <div>
          <p className="text-bone max-w-none">{t(blocks, "footer.tagline")}</p>
          <p className="mt-1 text-small muted max-w-none">
            <a href={`mailto:${settings.email}`} className="text-bone">{settings.email}</a>
            {settings.location ? <span className="muted">, {settings.location}</span> : null}
          </p>
          <p className="mt-2 text-small muted max-w-none">
            {year} {t(blocks, "footer.copyright")}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap md:flex-col gap-x-3 gap-y-1 list-none m-0 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-small font-medium muted hover:text-bone no-underline transition-colors dur-fast">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/feed.xml" className="text-small font-medium muted hover:text-bone no-underline transition-colors dur-fast">
                {t(blocks, "footer.rssLabel")}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
