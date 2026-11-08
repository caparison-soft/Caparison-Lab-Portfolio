import Link from "next/link";
import type { Blocks, Settings } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { CtaButton } from "@/components/site/cta-button";
import { LocalTime } from "@/components/site/local-time";
import { Split, vars } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";

type FooterProps = { blocks: Blocks; settings: Settings };

/**
 * Olive-950 footer: a last call to action, the pages, how to reach us, the
 * studio's local time, and the name set huge across the bottom edge, rising
 * in word by word. The heading's words and then each block rise in as the
 * footer arrives (on the home page, right after the crowd story). Server component; the clock is the one client island.
 */
export function SiteFooter({ blocks, settings }: FooterProps) {
  const year = new Date().getFullYear();
  const pages = [
    { href: "/#services", label: t(blocks, "nav.services") },
    { href: "/industries/home-services", label: t(blocks, "nav.homeServices") },
    { href: "/#work", label: t(blocks, "nav.work") },
    { href: "/#pricing", label: t(blocks, "nav.pricing") },
    { href: "/about", label: t(blocks, "nav.about") },
    { href: "/#contact", label: t(blocks, "nav.contact") },
  ];
  const socials = Object.entries(settings.socials).filter(([, url]) => Boolean(url));

  return (
    <footer className="section-dark on-dark relative overflow-hidden px-3 md:px-[48px] pt-6 md:pt-7">
      <div className="max-w-layout mx-auto">
        <div className="cl-footer-top grid gap-5 lg:grid-cols-[1.3fr_1fr] items-end">
          {/* Hidden on the home page, where the crowd story shows it (src/styles/home-crowd.css). */}
          <div className="cl-footer-intro">
            <Split as="h2" text={t(blocks, "footer.heading")} className="text-display-l text-bone max-w-[14ch]" />
            <p className="mt-3 text-body-l" data-reveal="up" style={vars({ "--d": 120 })}>{t(blocks, "footer.sub")}</p>
            <div className="mt-4 flex flex-wrap gap-2 items-center" data-reveal="up" style={vars({ "--d": 220 })}>
              <Magnetic strength={0.25}>
                <CtaButton href="/#contact">{t(blocks, "nav.cta")}</CtaButton>
              </Magnetic>
              <a href={`mailto:${settings.email}`} className="cl-link text-bone text-body-l">{settings.email}</a>
            </div>
          </div>

          <div className="cl-footer-cols grid grid-cols-2 gap-4 text-small" data-reveal="up" style={vars({ "--d": 300 })}>
            <nav aria-label="Footer">
              <p className="text-sage mb-2">{t(blocks, "footer.pagesLabel")}</p>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {pages.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="cl-link text-bone text-body">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="text-sage mb-2">{t(blocks, "footer.reachLabel")}</p>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {settings.whatsapp ? (
                  <li><a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} className="cl-link text-bone text-body" target="_blank" rel="noopener noreferrer">{t(blocks, "footer.whatsappLabel")}</a></li>
                ) : null}
                {socials.map(([name, url]) => (
                  <li key={name}><a href={url} className="cl-link text-bone text-body capitalize" target="_blank" rel="noopener noreferrer">{name}</a></li>
                ))}
                <li><a href="/feed.xml" className="cl-link text-bone text-body">{t(blocks, "footer.rssLabel")}</a></li>
              </ul>
              <p className="mt-3 text-sage">{t(blocks, "footer.timeLabel")}</p>
              <p className="data text-bone mt-px"><LocalTime timeZone={t(blocks, "footer.timeZone")} /> {settings.location ?? ""}</p>
            </div>
          </div>
        </div>

        <hr className="cl-rule mt-6" />
        <div className="flex flex-wrap justify-between gap-2 py-3 text-small text-sage">
          <p className="max-w-none">{year} {t(blocks, "footer.copyright")}</p>
          <p className="max-w-none">{t(blocks, "footer.tagline")}</p>
        </div>
      </div>

      {/* The name across the bottom edge, clipped by the footer. */}
      <div aria-hidden="true" className="max-w-[1480px] mx-auto -mb-[0.2em] select-none">
        <Split as="div" text={settings.siteName} className="cl-footer-name text-bone" />
      </div>
    </footer>
  );
}
