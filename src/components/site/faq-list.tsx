"use client";
// Client component: questions that open one at a time with an animated height
// (grid-template-rows, CSS in site.css). Buttons with aria-expanded, so it is
// keyboard and screen-reader complete.

import { useId, useState, type ReactNode } from "react";

export function FaqList({ items }: { items: { question: string; answer: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.question} className="cl-faq-item" data-open={isOpen}>
            <h3 className="m-0">
              <button type="button" className="cl-faq-q" aria-expanded={isOpen} aria-controls={`${base}-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{it.question}</span>
                <span className="cl-faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div id={`${base}-${i}`} className="cl-faq-a" role="region" aria-hidden={!isOpen}>
              <div>
                <div className="pb-3 text-body-l text-ash max-w-[60ch]">{it.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
