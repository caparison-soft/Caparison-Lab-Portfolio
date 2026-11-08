"use client";
// Client component: a list where the item crossing the middle of the screen is
// "in focus" (full ink, lime marker) and the rest are dimmed, so the eye reads
// one line at a time while scrolling. Reduced motion keeps all items full.

import { useEffect, useRef } from "react";

export function FocusList({ items }: { items: { title: string; note: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const els = Array.from(list.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) els.forEach((el) => el.setAttribute("data-active", String(el === e.target)));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="focus-list list-none p-0 m-0">
      {items.map((it, i) => (
        <li key={it.title} data-active={i === 0}>
          <span className="focus-mark" aria-hidden="true" />
          <div>
            <h3 className="focus-title">{it.title}</h3>
            <p className="focus-note mt-1 text-body-l text-ash">{it.note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
