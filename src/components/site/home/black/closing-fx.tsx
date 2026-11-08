"use client";
// Client component: the closing offer's motion (owner, 2026-11-07: "make it
// more dynamic"). It writes CSS variables on the section and the CSS does the
// rest: a Leaf light follows the pointer (--mx, --my), the rings lean away
// from it (--tx, --ty) and open out as the section scrolls through (--p).
// Pointer work is for fine pointers only; reduced motion leaves it all still.

import { useEffect, useRef, type ReactNode } from "react";

export function ClosingFx({ children, className, labelledBy }: { children: ReactNode; className?: string; labelledBy: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        el.style.setProperty("--p", p.toFixed(3));
      });
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--tx", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      el.style.setProperty("--ty", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      el.dataset.lit = "true";
    };
    const onLeave = () => {
      el.dataset.lit = "false";
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={ref} className={className} aria-labelledby={labelledBy}>
      <span className="hbc-spot" aria-hidden="true" />
      {children}
    </section>
  );
}
