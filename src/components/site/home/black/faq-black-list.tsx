"use client";
// Client component: questions on black that open one at a time. Each is a
// raised card with a button (aria-expanded) and an answer region whose height
// animates with the grid-rows trick; a closed answer is visibility: hidden
// once it has folded, so its contents leave the tab order and the
// accessibility tree. Reduced motion: the CSS drops the transitions.

import { useId, useState, type ReactNode } from "react";
import { vars } from "@/components/motion/split";

export function FaqBlackList({ items }: { items: { question: string; answer: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="hbf" data-reveal="up" style={vars({ "--d": 120 })}>
      {items.map((it, i) => {
        const isOpen = open === i;
        const qid = `${base}-q${i}`;
        const aid = `${base}-a${i}`;
        return (
          <div key={it.question} className="hbf-item" data-open={isOpen}>
            <h3 className="m-0">
              <button id={qid} type="button" className="hbf-q" aria-expanded={isOpen} aria-controls={aid} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{it.question}</span>
                <span className="hbf-icon" aria-hidden="true" />
              </button>
            </h3>
            <div id={aid} className="hbf-a" role="region" aria-labelledby={qid}>
              <div>
                <div className="hbf-a-inner hb-sub text-body-l">{it.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqBlackList;
