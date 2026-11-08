"use client";
// Client component: Lenis smooth scrolling for the public site. Off for
// reduced motion and for touch devices (native momentum is better there).
// Anything that scrolls on its own (the chat panel, dialogs) carries
// data-lenis-prevent.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true, anchors: { offset: -88 } });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // A new route starts at the top, without gliding there.
  useEffect(() => {
    if (!window.location.hash) window.__lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
