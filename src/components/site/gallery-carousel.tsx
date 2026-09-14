"use client";
// Client component: the case-page gallery as a zoom slider (owner-supplied
// "zoom-slider" design, 2026-09-14, rebuilt on our tokens without GSAP or
// SplitText). One slide is active and large in the centre; the others sit
// small in a strip beside it. Moving to a neighbour shrinks the old slide
// and grows the new one (small to grow). Drag with the mouse or a finger,
// use the arrow buttons, or the keyboard arrows. The list loops. Title and
// subtitle of the active slide sit above. Reduced motion: instant swap.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MediaFrame } from "@/components/ui";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = { items: MediaItem[]; labels: { slide: string } };

const SMALL = 0.28; // neighbour scale relative to the active frame

export function GalleryCarousel({ items, labels }: Props) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const hovered = useRef(false);

  const go = useCallback((to: number) => {
    if (n < 2) return;
    setIndex(((to % n) + n) % n);
  }, [n]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Arrow keys while the slider is focused or under the pointer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const focused = rootRef.current?.contains(document.activeElement);
      if (!hovered.current && !focused) return;
      const el = e.target as HTMLElement | null;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    drag.current = { x: e.clientX, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    if (Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (dx < -40) next();
    else if (dx > 40) prev();
  };

  // The strip shows the active slide plus two neighbours on each side, looped.
  const order = n < 2 ? [0] : [-2, -1, 0, 1, 2].map((o) => ((index + o) % n + n) % n);
  const active = items[index];
  const hasText = items.some((m) => m.title || m.caption);
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 28 };
  const fade = reduced ? { duration: 0 } : { duration: 0.2 };

  const Arrow = ({ d, onClick, label }: { d: "left" | "right"; onClick: () => void; label: string }) => (
    <button type="button" onClick={onClick} aria-label={label} className="h-[40px] w-[40px] inline-flex items-center justify-center rounded-full bg-paper border border-divider-light text-ink hover:bg-bone transition-colors dur-fast">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d={d === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );

  return (
    <div ref={rootRef} className="gallery" onMouseEnter={() => { hovered.current = true; }} onMouseLeave={() => { hovered.current = false; }}>
      {hasText ? (
        <div className="text-center mb-3 min-h-[56px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={fade}>
              {active?.title ? <p className="text-h4 font-medium text-ink max-w-none">{active.title}</p> : null}
              {active?.caption ? <p className="text-small text-ash max-w-[60ch] mx-auto mt-[2px]">{active.caption}</p> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      <div
        className="relative flex items-center justify-center gap-2 md:gap-3 select-none cursor-grab active:cursor-grabbing touch-pan-y overflow-hidden py-2"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.slide}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {order.map((i, pos) => {
          const m = items[i];
          const on = pos === (n < 2 ? 0 : 2);
          const dist = Math.abs(pos - 2);
          return (
            <motion.figure
              key={`${m.id}-${pos}`}
              layout
              initial={reduced ? false : { opacity: 0, scale: SMALL * 0.8 }}
              animate={{ opacity: dist > 1 ? 0.35 : dist === 1 ? 0.6 : 1, scale: 1 }}
              transition={spring}
              style={{ width: on ? "min(62%, 720px)" : `${SMALL * 100}%`, maxWidth: on ? 720 : 200 }}
              className={cx("m-0 flex-none", !on && "cursor-pointer hidden sm:block")}
              onClick={() => { if (!on && !drag.current?.moved) go(i); }}
              aria-roledescription="slide"
              aria-label={`${labels.slide} ${i + 1} / ${n}`}
              aria-current={on ? "true" : undefined}
              aria-hidden={!on || undefined}
            >
              <MediaFrame ratio={16 / 10} blurDataUrl={m.blurDataUrl ?? undefined} className={cx(on && "shadow-[0_24px_48px_rgb(0_0_0/0.45)]")}>
                <img {...imageSrcSet(m.keyPrefix, m.variants)} sizes={on ? "(min-width: 1024px) 720px, 62vw" : "200px"} alt={on ? (m.alt ?? "") : ""} width={m.width ?? 16} height={m.height ?? 10} loading={on ? "eager" : "lazy"} decoding="async" draggable={false} />
              </MediaFrame>
            </motion.figure>
          );
        })}
      </div>

      {n > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-3">
          <Arrow d="left" onClick={prev} label={`${labels.slide} ${((index - 1 + n) % n) + 1}`} />
          <p className="data text-ash max-w-none tabular-nums">{index + 1} / {n}</p>
          <Arrow d="right" onClick={next} label={`${labels.slide} ${(index + 1) % n + 1}`} />
        </div>
      ) : null}
    </div>
  );
}
