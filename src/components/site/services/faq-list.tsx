"use client";
// Client component: the FAQ disclosure. One answer open at a time, which
// needs shared state. Buttons carry aria-expanded and aria-controls; a closed
// answer is inert so its links are not reachable by Tab while hidden. The
// height animation is the .cl-faq-* grid-rows transition in site.css.

import { useState, type ReactNode } from "react";

export type FaqEntry = { question: string; answer: ReactNode };

export function FaqList({ items, idPrefix }: { items: FaqEntry[]; idPrefix: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="sv-faq">
      {items.map((it, i) => {
        const isOpen = open === i;
        const qid = `${idPrefix}-q-${i}`;
        const aid = `${idPrefix}-a-${i}`;
        return (
          <div key={qid} className="cl-faq-item" data-open={isOpen ? "true" : "false"}>
            <h3 className="sv-faq-h">
              <button type="button" id={qid} className="cl-faq-q" aria-expanded={isOpen} aria-controls={aid} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{it.question}</span>
                <span className="cl-faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div id={aid} role="region" aria-labelledby={qid} className="cl-faq-a" inert={!isOpen}>
              <div>
                <div className="sv-faq-body">{it.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
