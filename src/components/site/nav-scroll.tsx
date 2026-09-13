"use client";
// Client component: flags the document when the page has scrolled so the
// bar can shrink to its compact state. No re-render, one attribute.

import { useEffect } from "react";

export function NavScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let compact = false;
    const update = () => {
      const next = window.scrollY > 64;
      if (next !== compact) {
        compact = next;
        root.setAttribute("data-nav-compact", next ? "true" : "false");
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); root.removeAttribute("data-nav-compact"); };
  }, []);
  return null;
}
