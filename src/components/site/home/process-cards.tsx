"use client";
// Client component: the process steps as pinned, tilted cards laid out in a
// zig-zag with a dashed path running between them (owner-supplied design,
// 2026-09-14, rebuilt on our tokens). The path's dashes crawl; reduced
// motion holds them still. Under md the cards stack in order.

import { motion, useReducedMotion } from "motion/react";
import type { ProcessItem } from "@/lib/queries/home";
import { pad2 } from "@/lib/format";
import { cx } from "@/lib/cx";

/** Card positions and tilts for up to five steps, in a 1000-wide frame. */
const SLOTS = [
  { className: "md:absolute md:top-0 md:left-[12%]", tilt: "md:rotate-[6deg]" },
  { className: "md:absolute md:top-[120px] md:right-[12%]", tilt: "md:-rotate-[6deg]" },
  { className: "md:absolute md:top-[430px] md:left-[12%]", tilt: "md:rotate-[6deg]" },
  { className: "md:absolute md:top-[550px] md:right-[8%]", tilt: "md:-rotate-[6deg]" },
  { className: "md:absolute md:top-[850px] md:left-[12%]", tilt: "md:rotate-[6deg]" },
];
const HEIGHTS = [0, 380, 440, 780, 900, 1130];
const SEGMENTS = [
  "M 290 150 C 500 150, 550 270, 710 270",
  " C 850 270, 500 350, 290 450",
  " C 290 600, 550 720, 750 720",
  " C 950 720, 500 800, 290 850",
];

function Pin({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16 3a1 1 0 0 1 .117 1.993l-.117.007v4.764l1.894 3.789a1 1 0 0 1 .1.331l.006.116v2a1 1 0 0 1-.883.993l-.117.007h-4v4a1 1 0 0 1-1.993.117l-.007-.117v-4h-4a1 1 0 0 1-.993-.883l-.007-.117v-2a1 1 0 0 1 .06-.34l.046-.107 1.894-3.791V5a1 1 0 0 1-.117-1.993L8 3h8z" />
    </svg>
  );
}

export function ProcessCards({ steps }: { steps: ProcessItem[] }) {
  const reduced = useReducedMotion();
  const n = Math.min(steps.length, SLOTS.length);
  const height = HEIGHTS[n] ?? 1130;
  const path = SEGMENTS.slice(0, Math.max(0, n - 1)).join("");

  return (
    <div className="relative">
      {/* Ruled-paper lines behind the cards, fading out at the sides. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(#ECEEE8 1px, transparent 1px)", backgroundSize: "100% 32px", marginTop: 4 }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-bone to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-bone to-transparent" />

      <ol className="list-none m-0 p-0 relative flex flex-col gap-4 md:block md:h-[var(--h)]" style={{ "--h": `${height}px` } as React.CSSProperties}>
        {n > 1 ? (
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d={path}
              stroke="currentColor"
              className="text-sage/50"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ strokeDashoffset: 0 }}
              animate={reduced ? { strokeDashoffset: 0 } : { strokeDashoffset: -140 }}
              transition={reduced ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        ) : null}

        {steps.slice(0, n).map((s, i) => {
          const slot = SLOTS[i];
          return (
            <li key={s.order} className={cx("relative w-full md:w-[280px] transition-transform dur-base ease-out hover:z-30 md:hover:scale-105 motion-reduce:transition-none", slot.className, slot.tilt)}>
              <div className="bg-paper border border-divider-light rounded-lg p-1 shadow-[0_24px_48px_rgb(0_0_0/0.45)]">
                <Pin className="w-[32px] h-[32px] text-lime mx-auto mb-2 mt-1" />
                <div className="bg-bone border border-divider-light rounded-lg p-2 flex flex-col">
                  <span className="data text-h3 text-lime mb-2">{pad2(s.order)}</span>
                  <h3 className="text-h4 font-medium text-ink leading-none mb-1">{s.title}</h3>
                  {s.duration ? <p className="data text-ash max-w-none mb-1">{s.duration}</p> : null}
                  <p className="text-small text-ash max-w-none">{s.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
