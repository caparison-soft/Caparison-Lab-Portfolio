"use client";
// Client component: the previous/next control is the only interactivity.
// No auto-rotation, ever.

import { useState } from "react";
import type { TestimonialItem } from "@/lib/queries/home";

type TestimonialsProps = { items: TestimonialItem[]; labels: { previous: string; next: string; of: string } };

export function Testimonials({ items, labels }: TestimonialsProps) {
  const [i, setI] = useState(0);
  if (items.length === 0) return null;
  const item = items[i];
  const canNav = items.length > 1;

  const btn = "inline-flex items-center justify-center w-[40px] h-[40px] rounded-sm border border-divider-light text-ink hover:border-ink transition-colors dur-fast disabled:opacity-50 disabled:pointer-events-none";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
      <div className="flex items-center lg:items-start lg:flex-col gap-2">
        <p className="data text-ash max-w-none" aria-live="polite">{i + 1} {labels.of} {items.length}</p>
        {canNav ? (
          <div className="flex gap-1">
            <button type="button" className={btn} onClick={() => setI((i - 1 + items.length) % items.length)} aria-label={labels.previous}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
            </button>
            <button type="button" className={btn} onClick={() => setI((i + 1) % items.length)} aria-label={labels.next}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
            </button>
          </div>
        ) : null}
      </div>
      <figure className="m-0">
        <blockquote className="m-0">
          <p className="text-display-l text-ink max-w-[26ch]">{item.quote}</p>
        </blockquote>
        <figcaption className="mt-3 text-body text-ash">
          <span className="text-ink font-medium">{item.authorName}</span>
          {item.authorRole ? <>, {item.authorRole}</> : null}
          {item.company ? <>, {item.company}</> : null}
        </figcaption>
      </figure>
    </div>
  );
}
