"use client";
// The hero's right-hand column (owner, 2026-10-29: the 3D logo that used to
// sit here said nothing, and enquiries are thin — the space should carry
// proof). One case at a time: the picture, who it was for, the title and the
// single number that makes the case, the whole card a link to the case page.
// It advances on its own every ADVANCE_MS and the thin bar under it shows how
// long is left. Pointer or keyboard inside it stops the clock; so does a
// hidden tab, so a visitor coming back does not land mid-card. Reduced motion
// never advances on its own and leaves the dots to do the work.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { setHeroState } from "@/lib/hero-state";

export type HeroWorkItem = {
  slug: string;
  title: string;
  category: string | null;
  metric: { value: string; label: string } | null;
  cover: { src: string; srcSet: string; alt: string; blurDataUrl: string | null };
};

type Props = { items: HeroWorkItem[]; viewLabel: string };

const ADVANCE_MS = 5000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroWork({ items, viewLabel }: Props) {
  const reduced = useReducedMotion() ?? false;
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const n = items.length;

  const go = useCallback((next: number) => setI(((next % n) + n) % n), [n]);

  // The load screen waits on this card: the page is not whole until the first
  // picture is actually drawn. An error counts as done - a missing image must
  // never hold the screen up.
  const firstShown = useRef(false);
  const ready = useCallback(() => {
    if (firstShown.current) return;
    firstShown.current = true;
    setHeroState("ready");
  }, []);
  useEffect(() => { if (n === 0) setHeroState("off"); }, [n]);
  // A cached picture is already decoded before React hydrates, so its onLoad
  // never fires and the screen would sit there until the cap.
  useEffect(() => {
    const img = rootRef.current?.querySelector("img");
    if (img?.complete) ready();
  }, [ready]);

  // A hidden tab holds too: coming back to a card that moved three times
  // while nobody watched reads as a glitch.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const running = !reduced && n > 1 && !held && visible;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(i + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [running, i, go]);

  if (n === 0) return null;
  const item = items[i];

  return (
    <div
      ref={rootRef}
      className="hero-work"
      data-hero-wait=""
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(e) => { if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setHeld(false); }}
    >
      {/* aria-live so the card's change is announced once, not on every frame. */}
      <div className="relative" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={item.slug}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.985 }}
            transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
          >
            <Link href={`/work/${item.slug}`} className="hero-work-card group" aria-label={`${item.title} — ${viewLabel}`}>
              <span className="hero-work-shot">
                <img
                  src={item.cover.src}
                  srcSet={item.cover.srcSet}
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  alt={item.cover.alt}
                  width={1600}
                  height={900}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={ready}
                  onError={ready}
                  style={item.cover.blurDataUrl ? { backgroundImage: `url(${item.cover.blurDataUrl})`, backgroundSize: "cover" } : undefined}
                />
              </span>
              <span className="hero-work-body">
                {item.category ? <span className="hero-work-cat">{item.category}</span> : null}
                <span className="hero-work-title">{item.title}</span>
                {item.metric ? (
                  <span className="hero-work-metric">
                    <b className="data">{item.metric.value}</b> {item.metric.label}
                  </span>
                ) : null}
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {n > 1 ? (
        <div className="hero-work-foot">
          {/* The bar restarts with the index; holding it pauses the animation
              rather than resetting it, so the pointer leaving carries on. */}
          <span className="hero-work-bar" aria-hidden="true">
            <i key={i} data-held={held || !visible || reduced ? "true" : "false"} style={{ animationDuration: `${ADVANCE_MS}ms` }} />
          </span>
          <div className="hero-work-dots" role="tablist" aria-label={viewLabel}>
            {items.map((p, k) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={p.title}
                className={cx("hero-work-dot", k === i && "is-on")}
                onClick={() => go(k)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
