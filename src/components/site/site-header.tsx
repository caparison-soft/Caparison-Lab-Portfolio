"use client";
// Client component: the floating header. Transparent over the top of the page,
// a frosted bar once scrolled, hidden while scrolling down and back as soon as
// the visitor scrolls up. Under lg the links move into a full-screen sheet.
// Escape and a route change close the sheet.
//
// Nav tabs (owner, 2026-11-07, after the Vercel-style tabs he pasted): a soft
// plate follows the pointer or keyboard focus from link to link, and a 2px line
// sits under the current page and slides when the page changes. The pasted
// version used divs with click handlers and hex colours; these are real links,
// the current page comes from the route, and the colours are tokens.
// The home page is black (owner, 2026-11-07), so the header takes the dark
// tone there and the light tone everywhere else.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HexMark } from "@/components/site/hex-mark";
import { CtaButton } from "@/components/site/cta-button";

export type HeaderLink = { href: string; label: string };

type SiteHeaderProps = {
  siteName: string;
  links: HeaderLink[];
  cta: HeaderLink;
  labels: { menuOpen: string; menuClose: string; email: string };
  email: string;
};

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function SiteHeader({ siteName, links, cta, labels, email }: SiteHeaderProps) {
  // When Vercel regenerates the static home page (the hourly ISR window), the
  // server render sees "/index" where the browser sees "/". The header then
  // rendered its light tone on the server and its dark tone in the browser, and
  // that mismatch made React rebuild the whole page, wiping the boot script's
  // html[data-js] and with it the orbit's layout (found live, 2026-11-08).
  const raw = usePathname();
  const pathname = raw === "/index" || raw.endsWith("/index") ? raw.slice(0, -"/index".length) || "/" : raw;
  // Dark tone on the black pages: home, services, work and the case pages (owner, 2026-11-07).
  const dark = pathname === "/" || pathname.startsWith("/services") || pathname.startsWith("/work");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  const navRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const plateShown = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide after the first screen when heading down; show on any upward move.
      if (y > 480 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // One-page site: on the home page the current tab follows the section in
  // view (services, work, pricing); above them it is Home.
  const [section, setSection] = useState<string | null>(null);
  useEffect(() => {
    setSection(null);
    if (pathname !== "/") return;
    const ids = links.map((l) => l.href).filter((h) => h.startsWith("/#")).map((h) => h.slice(2));
    const pick = () => {
      const line = window.innerHeight * 0.4;
      let cur: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line && el.getBoundingClientRect().bottom > line) cur = id;
      }
      setSection((s) => (s === cur ? s : cur));
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    return () => window.removeEventListener("scroll", pick);
  }, [pathname, links]);

  const isCurrent = useCallback(
    (href: string) => {
      if (href.startsWith("/#")) return pathname === "/" && section === href.slice(2);
      if (href === "/") return pathname === "/" && !section;
      return pathname.startsWith(href);
    },
    [pathname, section],
  );

  // Put an indicator under a link: left and width from the link's own box.
  const place = (el: HTMLSpanElement | null, a: HTMLElement) => {
    if (!el) return;
    el.style.left = `${a.offsetLeft}px`;
    el.style.width = `${a.offsetWidth}px`;
  };

  // The line follows the current page. The first placement does not slide in
  // from nowhere; later route changes do slide.
  const placedOnce = useRef(false);
  useIsoLayoutEffect(() => {
    const nav = navRef.current, line = lineRef.current;
    if (!nav || !line) return;
    const sync = () => {
      const current = [...nav.querySelectorAll<HTMLAnchorElement>("a")].find((a) => a.getAttribute("aria-current") === "page");
      line.style.opacity = current ? "1" : "0";
      if (!current) return;
      if (!placedOnce.current) {
        line.style.transition = "none";
        place(line, current);
        void line.offsetWidth;
        line.style.transition = "";
        placedOnce.current = true;
      } else place(line, current);
    };
    sync();
    // Webfonts change the link widths once they load.
    document.fonts?.ready.then(sync);
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [pathname, section]);

  const showPlate = (a: HTMLElement) => {
    const plate = plateRef.current;
    if (!plate) return;
    if (!plateShown.current) {
      // Appear under the link rather than sliding in from the last one.
      plate.style.transition = "opacity 250ms";
      place(plate, a);
      void plate.offsetWidth;
      plate.style.transition = "";
    }
    place(plate, a);
    plate.style.opacity = "1";
    plateShown.current = true;
  };
  const hidePlate = () => {
    if (plateRef.current) plateRef.current.style.opacity = "0";
    plateShown.current = false;
  };

  return (
    <>
      <header className="cl-header" data-scrolled={scrolled} data-hidden={hidden && !open} data-open={open} data-tone={dark ? "dark" : "light"}>
        <div className="cl-header-bar">
          <Link href="/" className="flex items-center gap-1 no-underline flex-none" aria-label={siteName}>
            {dark ? (
              <HexMark variant="simple" maskId="hexmark-header" className="cl-header-mark w-[26px] h-[26px] flex-none" />
            ) : (
              <HexMark aperture="paper" className="w-[28px] h-[28px] flex-none" />
            )}
            <img src={dark ? "/brand/wordmark-bone.png" : "/brand/wordmark-ink.png"} alt="" width={384} height={102} className="w-[98px] h-[26px] object-contain" />
          </Link>

          <nav
            ref={navRef}
            aria-label="Main"
            className="cl-tabs hidden lg:block mx-auto"
            onPointerLeave={hidePlate}
            onBlur={(e) => {
              if (!navRef.current?.contains(e.relatedTarget as Node | null)) hidePlate();
            }}
          >
            <span ref={plateRef} className="cl-tabs-plate" aria-hidden="true" />
            <span ref={lineRef} className="cl-tabs-line" aria-hidden="true" />
            <ul className="cl-tabs-list">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="cl-tab"
                    aria-current={isCurrent(l.href) ? "page" : undefined}
                    onPointerEnter={(e) => showPlate(e.currentTarget)}
                    onFocus={(e) => {
                      if (e.currentTarget.matches(":focus-visible")) showPlate(e.currentTarget);
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto lg:ml-0 flex items-center gap-1">
            <Link href={cta.href} className="cl-talk hidden sm:inline-flex">
              {cta.label}
            </Link>
            <button
              type="button"
              className="cl-burger lg:hidden"
              aria-expanded={open}
              aria-controls="site-sheet"
              aria-label={open ? labels.menuClose : labels.menuOpen}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="site-sheet" className="cl-sheet lg:hidden" data-open={open} aria-hidden={!open} inert={!open}>
        <nav aria-label="Menu" className="flex-1">
          {links.map((l, i) => (
            <Link key={l.href} href={l.href} className="cl-sheet-link" style={{ ["--i" as string]: i }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 items-start">
          <CtaButton href={cta.href}>{cta.label}</CtaButton>
          <a href={`mailto:${email}`} className="cl-link text-ash">{labels.email || email}</a>
        </div>
      </div>
    </>
  );
}
