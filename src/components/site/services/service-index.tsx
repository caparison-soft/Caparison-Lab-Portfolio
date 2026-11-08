"use client";
// Client component: the sticky index beside the service groups on lg+. It reads
// the scroll position to mark the group in view (aria-current) and to fill that
// group's bar as you read through it. Plain anchors underneath, so it works as
// a list of links before hydration and without JS.

import { useEffect, useRef, useState } from "react";
import { vars } from "@/components/motion/split";

export function ServiceIndex({ label, items }: { label: string; items: { slug: string; title: string }[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const slugs = items.map((i) => i.slug).join(",");

  useEffect(() => {
    const ids = slugs.split(",");
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= line) current = i;
        const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
        const li = listRef.current?.children[i] as HTMLElement | undefined;
        li?.style.setProperty("--p", p.toFixed(3));
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [slugs]);

  return (
    <nav aria-label={label} className="sv-index">
      <p className="sv-index-label">{label}</p>
      <ol ref={listRef} className="sv-index-list">
        {items.map((it, i) => (
          <li key={it.slug} style={vars({ "--p": 0 })}>
            <a href={`#${it.slug}`} className="sv-index-link" aria-current={i === active ? "location" : undefined}>
              <span className="sv-index-bar" aria-hidden="true" />
              <span>{it.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
