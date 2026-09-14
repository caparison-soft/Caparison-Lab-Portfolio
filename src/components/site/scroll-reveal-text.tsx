"use client";
// Client component: the case-page body reads in as you scroll (owner-supplied
// "text gradient scroll", 2026-09-14, rebuilt on our tokens). Applied to the
// rendered body after hydration: every text node inside a paragraph, heading
// or list item is split into words; each word's opacity follows the scroll
// position of its block, so the text brightens line by line as it enters the
// middle of the viewport and dims again once the block scrolls past. Marks
// (bold, links, code) survive because only text nodes are touched. Reduced
// motion, or no scroll-driven animations in the browser, leaves the text as
// rendered.

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

const BLOCKS = "p, h2, h3, li > div > p, blockquote p, aside p";
const DIM = 0.18;

export function ScrollRevealText({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    if (typeof CSS === "undefined" || !CSS.supports("animation-timeline: view()")) return;

    // Split text nodes into word spans once.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const parent = n.parentElement;
        if (!parent || !parent.closest(BLOCKS) || parent.closest("pre, code, figcaption")) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const texts: Text[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode as Text);
    for (const t of texts) {
      const frag = document.createDocumentFragment();
      const parts = (t.nodeValue ?? "").split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
        const span = document.createElement("span");
        span.className = "reveal-word";
        span.textContent = part;
        frag.appendChild(span);
      }
      t.replaceWith(frag);
    }

    // Each block drives its own words: word i of n animates over a slice of the
    // block's view timeline, so the first words brighten before the last.
    const blocks = root.querySelectorAll<HTMLElement>(BLOCKS);
    blocks.forEach((block) => {
      const words = block.querySelectorAll<HTMLElement>(".reveal-word");
      const n = words.length || 1;
      words.forEach((w, i) => {
        // Word i brightens over a slice between 12% and 48% of the block's travel.
        const start = 12 + (i / n) * 30;
        w.style.setProperty("--reveal-start", `${start.toFixed(2)}%`);
        w.style.setProperty("--reveal-end", `${(start + 6).toFixed(2)}%`);
      });
      block.classList.add("reveal-block");
    });
    root.dataset.reveal = "on";
  }, [reduced]);

  return <div ref={ref} className={className} style={{ ["--reveal-dim" as string]: DIM }}>{children}</div>;
}
