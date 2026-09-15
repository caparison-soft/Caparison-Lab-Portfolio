"use client";
// Client component: flags the document with the scroll state (compact header)
// and with the ground under the header (dark or light) so the transparent
// header can invert its wordmark and toggle. No re-render, two attributes.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function NavScroll() {
  const pathname = usePathname();
  // Re-run on every route: the layout persists, so the ground under the header
  // would otherwise stay whatever the first page had.
  useEffect(() => {
    const root = document.documentElement;
    let compact: boolean | null = null;
    let ground: "dark" | "light" | null = null;
    let raf = 0;
    const update = () => {
      raf = 0;
      const nextCompact = window.scrollY > 64;
      if (nextCompact !== compact) {
        compact = nextCompact;
        root.setAttribute("data-nav-compact", nextCompact ? "true" : "false");
      }
      // The section just under the header's left edge decides the wordmark colour.
      const header = document.querySelector<HTMLElement>(".site-nav");
      const y = (header?.getBoundingClientRect().bottom ?? 64) + 2;
      // Skip the header itself and the load screen (it covers the page while
      // this first runs and is not part of the ground).
      const hit = document.elementsFromPoint(24, y).find((el) => !el.closest("header, .preloader"));
      const nextGround = hit?.closest(".section-dark, .site-ground") ? "dark" : "light";
      if (nextGround !== ground) {
        ground = nextGround;
        root.setAttribute("data-nav-ground", nextGround);
      }
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    // The route's content lands a frame after the pathname changes.
    const settle = window.setTimeout(update, 0);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      root.removeAttribute("data-nav-compact");
      root.removeAttribute("data-nav-ground");
    };
  }, [pathname]);
  return null;
}
