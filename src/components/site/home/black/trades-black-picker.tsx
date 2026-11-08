"use client";
// Client component: the trade picker on black. Trades are a list of buttons
// (a column at lg, wrapped pills below); pointing at one with a mouse,
// focusing it or tapping it shows its example large on the right. A soft
// highlight slides between the trades (motion layoutId). Nothing changes on
// its own. Under reduced motion MotionConfig ("user", in the layout) snaps the
// highlight and the example only crossfades.

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HbLink } from "./hb-link";

type Trade = { name: string; example: string };

const EASE = [0.16, 1, 0.3, 1] as const;

export function TradesBlackPicker({ trades, cta, labelledBy }: { trades: Trade[]; cta: string; labelledBy: string }) {
  const [active, setActive] = useState(0);
  const current = trades[active] ?? trades[0];
  if (!current) return null;

  return (
    <div className="hbt">
      <div className="hbt-list" role="group" aria-labelledby={labelledBy}>
        {trades.map((tr, i) => {
          const on = i === active;
          return (
            <button
              key={tr.name}
              type="button"
              className="hbt-tab"
              aria-pressed={on}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(i);
              }}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              {on ? <motion.span layoutId="hbt-glow" className="hbt-tab-bg" aria-hidden="true" transition={{ duration: 0.5, ease: EASE }} /> : null}
              <span className="hbt-tab-dot" aria-hidden="true" />
              <span className="relative">{tr.name}</span>
            </button>
          );
        })}
      </div>

      <div className="hbt-panel">
        <span className="hbt-glow" aria-hidden="true" />
        <div className="relative" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span className="hbt-name">{current.name}</span>
              <p className="hbt-example">{current.example}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <HbLink href="/industries/home-services" className="relative mt-5">{cta}</HbLink>
      </div>
    </div>
  );
}

export default TradesBlackPicker;
