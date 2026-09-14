"use client";
// Client component: the case-page gallery as a Swiper coverflow carousel
// (owner-supplied Skiper 47 / Carousel_001 settings, 2026-09-14): centred
// active slide, neighbours pushed back in depth, 2.43 slides in view, loop,
// grab-to-drag, clickable pagination. Chrome is ours: pagination dots in
// our tokens, arrow buttons, and the active slide's title and subtitle
// above. Reduced motion shortens the slide transition to nothing.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = { items: MediaItem[]; labels: { slide: string } };

export function GalleryCarousel({ items, labels }: Props) {
  const [index, setIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const reduced = useReducedMotion();
  const n = items.length;
  // Swiper's loop wants more slides than fit in view (about 2.5 here) plus
  // spares, or it disables itself. Short galleries are repeated until there
  // are at least eight slides; counter, dots and title use the real item.
  const reps = n > 1 ? Math.max(1, Math.ceil(8 / n)) : 1;
  const slides = Array.from({ length: reps }, () => items).flat();
  const active = items[index];
  const hasText = items.some((m) => m.title || m.caption);
  const fade = reduced ? { duration: 0 } : { duration: 0.2 };

  const Arrow = ({ d, onClick, label }: { d: "left" | "right"; onClick: () => void; label: string }) => (
    <button type="button" onClick={onClick} aria-label={label} className="h-[40px] w-[40px] inline-flex items-center justify-center rounded-full bg-paper border border-divider-light text-ink hover:bg-bone transition-colors dur-fast">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d={d === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );

  return (
    <div className="gallery">
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

      <Swiper
        onSwiper={setSwiper}
        onSlideChange={(s) => setIndex(s.realIndex % n)}
        modules={[EffectCoverflow, Keyboard]}
        effect="coverflow"
        coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false }}
        grabCursor
        centeredSlides
        loop={n > 1}
        loopAddBlankSlides={false}
        slidesPerView={1.6}
        breakpoints={{ 768: { slidesPerView: 2.43 } }}
        spaceBetween={40}
        speed={reduced ? 0 : 600}
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{ slideLabelMessage: `${labels.slide} {{index}} / {{slidesLength}}` }}
        className="gallery-swiper"
      >
        {slides.map((m, i) => (
          <SwiperSlide key={`${m.id}-${i}`} className="!h-auto">
            <div className={cx("rounded-lg overflow-hidden border border-divider-light bg-paper aspect-[16/10]")}>
              <img {...imageSrcSet(m.keyPrefix, m.variants)} sizes="(min-width: 1024px) 560px, 62vw" alt={m.alt ?? ""} width={m.width ?? 16} height={m.height ?? 10} loading={i < 3 ? "eager" : "lazy"} decoding="async" draggable={false} className="w-full h-full object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {n > 1 ? (
        <div className="flex justify-center gap-1 mt-2" role="tablist" aria-label={labels.slide}>
          {items.map((m, i) => (
            <button key={m.id} type="button" role="tab" aria-selected={i === index} aria-label={`${labels.slide} ${i + 1}`} onClick={() => { if (!swiper) return; const base = swiper.realIndex - (swiper.realIndex % n); swiper.slideToLoop(base + i); }} className="h-[20px] w-[20px] inline-flex items-center justify-center">
              <span className={cx("block h-[8px] w-[8px] rounded-full transition-colors dur-fast", i === index ? "bg-ink" : "bg-ash/35 hover:bg-ash")} />
            </button>
          ))}
        </div>
      ) : null}
      {n > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-3">
          <Arrow d="left" onClick={() => swiper?.slidePrev()} label={`${labels.slide} ${((index - 1 + n) % n) + 1}`} />
          <p className="data text-ash max-w-none tabular-nums">{index + 1} / {n}</p>
          <Arrow d="right" onClick={() => swiper?.slideNext()} label={`${labels.slide} ${((index + 1) % n) + 1}`} />
        </div>
      ) : null}
    </div>
  );
}
