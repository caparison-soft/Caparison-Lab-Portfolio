"use client";
// Client component: the trades picker. Hovering, focusing or clicking a trade
// swaps the example on the right, which slides in. Nothing moves on its own.

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Magnetic } from "@/components/motion/magnetic";

export function Trades({ trades, cta }: { trades: { name: string; example: string }[]; cta: string }) {
  const [active, setActive] = useState(0);
  const current = trades[active];
  if (!current) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-stretch">
      <div className="flex flex-wrap content-start gap-1" role="group">
        {trades.map((tr, i) => (
          <Magnetic key={tr.name} strength={0.15}>
            <button
              type="button"
              className="trade-chip"
              aria-pressed={i === active}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              {tr.name}
            </button>
          </Magnetic>
        ))}
      </div>
      <div className="trade-panel cl-card cl-spot" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="cl-chip cl-chip--ink">{current.name}</span>
            <p className="mt-3 text-h3 font-bold tracking-[-0.02em] leading-[1.2]">{current.example}</p>
          </motion.div>
        </AnimatePresence>
        <Link href="/industries/home-services" className="cl-link cl-link--always mt-4 inline-block text-ink">{cta}</Link>
      </div>
    </div>
  );
}
