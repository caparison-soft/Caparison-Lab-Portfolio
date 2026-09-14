"use client";
// Client component: the case-page gallery as a centred carousel. The active
// slide sits in the middle at full size, its neighbours peek on either side
// smaller and dimmer; dots below, the active slide's title and subtitle
// above. Native scroll-snap does the sliding (touch, trackpad, keyboard);
// clicking a neighbour or a dot scrolls to it. Reduced motion: no scaling
// transition and instant scroll.

import { useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = { items: MediaItem[]; labels: { slide: string } };

export function GalleryCarousel({ items, labels }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // The slide whose centre is nearest the track's centre is the active one.
  // The track is position: relative so offsetLeft is measured from it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const centre = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      Array.from(track.children).forEach((el, i) => {
        const s = el as HTMLElement;
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centre);
        if (d < dist) { dist = d; best = i; }
      });
      setIndex(best);
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { track.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [items.length]);

  const go = (to: number) => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.max(0, Math.min(items.length - 1, to));
    const s = track.children[i] as HTMLElement | undefined;
    if (!s) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  };

  const active = items[index];
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
        className="gallery-track relative flex items-center gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory py-2 -my-2"
        tabIndex={0}
        aria-roledescription="carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        }}
      >
        {items.map((m, i) => {
          const on = i === index;
          return (
            <figure
              key={m.id}
              className={cx(
                "m-0 w-[62%] md:w-[56%] flex-none snap-center transition-[transform,opacity] dur-slow ease-out motion-reduce:transition-none",
                on ? "scale-100 opacity-100" : "scale-[0.86] opacity-60 cursor-pointer",
              )}
              aria-roledescription="slide"
              aria-label={`${labels.slide} ${i + 1} / ${items.length}`}
              aria-current={on ? "true" : undefined}
              onClick={() => { if (!on) go(i); }}
            >
              <MediaFrame ratio={16 / 10} blurDataUrl={m.blurDataUrl ?? undefined}>
                <img {...imageSrcSet(m.keyPrefix, m.variants)} sizes="(min-width: 1024px) 600px, 62vw" alt={m.alt ?? ""} width={m.width ?? 16} height={m.height ?? 10} loading={i < 2 ? "eager" : "lazy"} decoding="async" draggable={false} />
              </MediaFrame>
            </figure>
          );
        })}
      </div>

      {items.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1" role="tablist" aria-label={labels.slide}>
          {items.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${labels.slide} ${i + 1}`}
              onClick={() => go(i)}
              className="h-[24px] w-[24px] inline-flex items-center justify-center rounded-full"
            >
              <span className={cx("block h-[8px] w-[8px] rounded-full transition-colors dur-fast", i === index ? "bg-ink" : "bg-ash/35 hover:bg-ash")} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
