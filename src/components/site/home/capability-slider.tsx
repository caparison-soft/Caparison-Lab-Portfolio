"use client";
// Client component: "What we build" as a hover slider (owner-supplied
// design, 2026-09-14, rebuilt on our tokens). Titles on the left; hovering
// or focusing one swaps the image on the right with a top-down clip reveal
// and fans its letters up. Each title links to its capability. The active
// blurb and price/timeline sit under the image. Reduced motion: colour
// change and a plain crossfade, no letter movement. Under md the titles
// stack above the image.

import Link from "next/link";
import { useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { DataLine, MediaFrame } from "@/components/ui";
import type { CapabilityItem } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

const clip = {
  visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1 },
  hidden: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", opacity: 1 },
};

/** Letters fan up one by one. Each word is an unbreakable run, so lines wrap only between words. */
function StaggerTitle({ text, active, reduced }: { text: string; active: boolean; reduced: boolean }) {
  if (reduced) return <span className="relative inline-block">{text}</span>;
  let n = 0;
  return (
    <span className="relative inline-flex flex-wrap gap-x-[0.28em]" aria-hidden="true">
      {text.split(" ").map((word, w) => (
        <span key={w} className="inline-flex whitespace-nowrap">
          {word.split("").map((ch) => {
            const i = n++;
            return (
              <span key={i} className="relative inline-block overflow-hidden align-bottom">
                <MotionConfig transition={{ delay: i * 0.02, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
                  <motion.span className="inline-block" initial={{ y: "0%" }} animate={active ? { y: "-110%" } : { y: "0%" }}>{ch}</motion.span>
                  <motion.span className="absolute left-0 top-0 inline-block" initial={{ y: "110%" }} animate={active ? { y: "0%" } : { y: "110%" }}>{ch}</motion.span>
                </MotionConfig>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export function CapabilitySlider({ items }: { items: CapabilityItem[] }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const current = items[active];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 md:gap-6 items-center">
      <ul className="list-none m-0 p-0 flex flex-col gap-1 md:gap-2">
        {items.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.slug}>
              <Link
                href={`/capabilities#${c.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cx("inline-block no-underline text-h2 font-bold tracking-[-0.02em] transition-colors dur-base", on ? "text-ink" : "text-ash/60 hover:text-ink")}
                aria-current={on ? "true" : undefined}
              >
                <span className="sr-only">{c.title}</span>
                <StaggerTitle text={c.title} active={on} reduced={reduced} />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="min-w-0">
        <div className="grid overflow-hidden rounded-lg [&>*]:col-start-1 [&>*]:row-start-1">
          {items.map((c, i) => (
            <motion.div
              key={c.slug}
              variants={reduced ? { visible: { opacity: 1 }, hidden: { opacity: 0 } } : clip}
              animate={i === active ? "visible" : "hidden"}
              transition={reduced ? { duration: 0.2 } : { ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
              initial={false}
              className={cx(i === active ? "z-10" : "z-0")}
              aria-hidden={i !== active}
            >
              <MediaFrame ratio={16 / 10} blurDataUrl={c.image?.blurDataUrl ?? undefined}>
                {c.image ? (
                  <img {...imageSrcSet(c.image.keyPrefix, c.image.variants)} sizes="(min-width: 1024px) 640px, 100vw" alt={c.image.alt ?? ""} width={c.image.width ?? 16} height={c.image.height ?? 10} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                ) : (
                  <div className="absolute inset-0 flex items-end p-3 bg-paper">
                    <span className="data text-ash">{c.slug}</span>
                  </div>
                )}
              </MediaFrame>
            </motion.div>
          ))}
        </div>
        {current ? (
          <div className="mt-2" aria-live="polite">
            <p className="text-body text-ash max-w-[52ch]">{current.blurb}</p>
            <div className="mt-1">
              <DataLine items={[...(current.startingPrice ? [{ value: current.startingPrice }] : []), ...(current.typicalTimeline ? [{ value: current.typicalTimeline }] : [])]} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
