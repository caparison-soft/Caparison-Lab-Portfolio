"use client";
// Client component: the case-page gallery as a carousel. Native scroll-snap
// does the sliding (touch, trackpad, keyboard all work without JavaScript);
// the buttons and the counter are progressive. Title and subtitle sit on a
// gradient at the foot of each slide. Reduced motion: instant scroll.

import { useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = { items: MediaItem[]; labels: { prev: string; next: string } };

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GalleryCarousel({ items, labels }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Which slide is in view, from the scroll position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const w = track.clientWidth || 1;
      setIndex(Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / w))));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { track.removeEventListener("scroll", onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [items.length]);

  const go = (to: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(items.length - 1, to));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  const many = items.length > 1;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="gallery-track flex overflow-x-auto snap-x snap-mandatory rounded-lg"
        tabIndex={0}
        aria-roledescription="carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        }}
      >
        {items.map((m, i) => (
          <figure key={m.id} className="m-0 w-full flex-none snap-start relative" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
            <MediaFrame ratio={16 / 10} blurDataUrl={m.blurDataUrl ?? undefined} radius="none">
              <img {...imageSrcSet(m.keyPrefix, m.variants)} sizes="(min-width: 1024px) 1000px, 100vw" alt={m.alt ?? ""} width={m.width ?? 16} height={m.height ?? 10} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            </MediaFrame>
            {m.title || m.caption ? (
              <figcaption className="absolute inset-x-0 bottom-0 p-3 md:p-4 pt-6 bg-gradient-to-t from-olive-950/85 to-olive-950/0 on-dark">
                {m.title ? <p className="text-h4 font-medium text-bone max-w-none">{m.title}</p> : null}
                {m.caption ? <p className="text-small text-sage max-w-[60ch] mt-[2px]">{m.caption}</p> : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {many ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="data text-ash max-w-none" aria-live="polite">{index + 1} / {items.length}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={labels.prev} className={cx("h-[32px] w-[32px] inline-flex items-center justify-center rounded-sm border border-divider-light bg-paper text-ink transition-colors dur-fast", index === 0 ? "opacity-40" : "hover:bg-bone")}>
              <Chevron dir="left" />
            </button>
            <button type="button" onClick={() => go(index + 1)} disabled={index === items.length - 1} aria-label={labels.next} className={cx("h-[32px] w-[32px] inline-flex items-center justify-center rounded-sm border border-divider-light bg-paper text-ink transition-colors dur-fast", index === items.length - 1 ? "opacity-40" : "hover:bg-bone")}>
              <Chevron dir="right" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
