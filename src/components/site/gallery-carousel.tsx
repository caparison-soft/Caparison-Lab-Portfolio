"use client";
// Client component: the case-page gallery as a centred, looping carousel.
// The active slide sits in the middle at full size with its neighbours
// peeking either side; the list wraps so there is always a slide on both
// sides. Native scroll-snap does the sliding (touch, trackpad); the mouse can
// drag; arrow keys work while the carousel is focused or under the pointer;
// dots below; the active slide's title and subtitle above.
//
// The loop: the slides are rendered three times and the view starts on the
// middle copy. When a scroll settles on a slide in the first or last copy the
// track jumps, without animation, to the same slide in the middle copy.
// Reduced motion: instant scrolling, no scale transition.

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = { items: MediaItem[]; labels: { slide: string } };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function GalleryCarousel({ items, labels }: Props) {
  const n = items.length;
  const loop = n > 1;
  const copies = loop ? 3 : 1;
  const slides = Array.from({ length: copies }, (_, c) => items.map((m, i) => ({ m, i, key: `${m.id}-${c}` }))).flat();

  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(loop ? n : 0); // index into `slides`
  const hovered = useRef(false);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const settle = useRef(0);

  const stride = () => {
    const t = trackRef.current;
    if (!t || t.children.length < 2) return 0;
    return (t.children[1] as HTMLElement).offsetLeft - (t.children[0] as HTMLElement).offsetLeft;
  };
  const leftFor = (i: number) => {
    const t = trackRef.current;
    const s = t?.children[i] as HTMLElement | undefined;
    if (!t || !s) return 0;
    return s.offsetLeft - (t.clientWidth - s.offsetWidth) / 2;
  };
  const nearest = () => {
    const t = trackRef.current;
    if (!t) return 0;
    const centre = t.scrollLeft + t.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(t.children).forEach((el, i) => {
      const s = el as HTMLElement;
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centre);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };

  // Start on the middle copy, without animation.
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.scrollLeft = leftFor(loop ? n : 0);
  }, [loop, n]);

  // Track the active slide; once a scroll settles on an outer copy, jump to the middle copy.
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(() => { raf = 0; setPos(nearest()); });
      if (!loop) return;
      window.clearTimeout(settle.current);
      settle.current = window.setTimeout(() => {
        if (drag.current) return;
        const i = nearest();
        if (i < n || i >= 2 * n) {
          const same = n + (((i % n) + n) % n);
          t.scrollLeft += (same - i) * stride();
          setPos(same);
        }
      }, 120);
    };
    t.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { t.scrollLeft = leftFor(nearest()); };
    window.addEventListener("resize", onResize);
    return () => { t.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); if (raf) window.cancelAnimationFrame(raf); window.clearTimeout(settle.current); };
  }, [loop, n]);

  const go = useCallback((to: number) => {
    const t = trackRef.current;
    if (!t) return;
    const i = loop ? to : Math.max(0, Math.min(n - 1, to));
    t.scrollTo({ left: leftFor(i), behavior: reducedMotion() ? "auto" : "smooth" });
  }, [loop, n]);

  // Arrow keys while the pointer is over the carousel (focus is handled on the track itself).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hovered.current || document.activeElement === trackRef.current) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(pos + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(pos - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pos]);

  // Mouse drag. Touch already scrolls natively.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const t = trackRef.current;
    if (!t) return;
    drag.current = { x: e.clientX, left: t.scrollLeft, moved: false, id: e.pointerId };
    t.setPointerCapture(e.pointerId);
    t.classList.add("is-dragging");
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const t = trackRef.current;
    if (!d || !t) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    t.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    const t = trackRef.current;
    if (!d || !t) return;
    t.classList.remove("is-dragging");
    if (t.hasPointerCapture(d.id)) t.releasePointerCapture(d.id);
    const moved = d.moved;
    drag.current = null;
    go(nearest());
    // Swallow the click that follows a drag so it does not also jump to a neighbour.
    if (moved) t.dataset.swallowClick = "1";
  };

  const activeIndex = ((pos % n) + n) % n;
  const active = items[activeIndex];
  const hasText = items.some((m) => m.title || m.caption);

  return (
    <div className="gallery">
      {hasText ? (
        <div className="text-center mb-3 min-h-[56px]" aria-live="polite">
          {active?.title ? <p className="text-h4 font-medium text-ink max-w-none">{active.title}</p> : null}
          {active?.caption ? <p className="text-small text-ash max-w-[60ch] mx-auto mt-[2px]">{active.caption}</p> : null}
        </div>
      ) : null}

      <div
        ref={trackRef}
        className="gallery-track relative flex items-center gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory py-2 -my-2 cursor-grab"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={labels.slide}
        onMouseEnter={() => { hovered.current = true; }}
        onMouseLeave={() => { hovered.current = false; }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(pos + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(pos - 1); }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => { const t = trackRef.current; if (t?.dataset.swallowClick) { delete t.dataset.swallowClick; e.stopPropagation(); e.preventDefault(); } }}
      >
        {slides.map((s, idx) => {
          const on = idx === pos;
          const clone = loop && (idx < n || idx >= 2 * n);
          return (
            <figure
              key={s.key}
              className={cx(
                "m-0 w-[62%] md:w-[56%] flex-none snap-center transition-[transform,opacity] dur-slow ease-out motion-reduce:transition-none select-none",
                on ? "scale-100 opacity-100" : "scale-[0.86] opacity-60 cursor-pointer",
              )}
              aria-roledescription="slide"
              aria-label={`${labels.slide} ${s.i + 1} / ${n}`}
              aria-current={on ? "true" : undefined}
              aria-hidden={clone || undefined}
              onClick={() => { if (!on) go(idx); }}
            >
              <MediaFrame ratio={16 / 10} blurDataUrl={s.m.blurDataUrl ?? undefined}>
                <img {...imageSrcSet(s.m.keyPrefix, s.m.variants)} sizes="(min-width: 1024px) 600px, 62vw" alt={clone ? "" : (s.m.alt ?? "")} width={s.m.width ?? 16} height={s.m.height ?? 10} loading={clone ? "lazy" : "eager"} decoding="async" draggable={false} />
              </MediaFrame>
            </figure>
          );
        })}
      </div>

      {n > 1 ? (
        <div className="mt-3 flex justify-center gap-1" role="tablist" aria-label={labels.slide}>
          {items.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`${labels.slide} ${i + 1}`}
              onClick={() => go(pos + (i - activeIndex))}
              className="h-[24px] w-[24px] inline-flex items-center justify-center rounded-full"
            >
              <span className={cx("block h-[8px] w-[8px] rounded-full transition-colors dur-fast", i === activeIndex ? "bg-ink" : "bg-ash/35 hover:bg-ash")} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
