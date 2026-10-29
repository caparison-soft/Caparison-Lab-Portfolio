"use client";
// The hero's right-hand column (owner, 2026-10-29: the 3D logo that used to
// sit here said nothing, and enquiries are thin — the space should carry
// proof). One case at a time: the picture, who it was for, the title and the
// single number that makes the case, the whole card a link to the case page.
// It advances on its own every ADVANCE_MS and the thin bar under it shows how
// long is left. Pointer or keyboard inside it stops the clock; so does a
// hidden tab, so a visitor coming back does not land mid-card.
//
// The change is the owner-supplied strip wipe (2026-10-29): the incoming
// picture arrives as STRIPS vertical columns that uncover left to right one
// after another, the whole image settling out of a slow zoom underneath. The
// pasted component drove this with GSAP and SplitText; clip-path and the
// motion already in the bundle do the same thing, so no new dependency.
// Reduced motion never advances on its own and swaps with no wipe at all.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
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
const STRIPS = 10;
const WIPE_S = 0.5;
const STRIP_STAGGER_S = 0.045;
const ZOOM_S = 1.1;
const ZOOM_FROM = 1.14;
const EASE = [0.16, 1, 0.3, 1] as const;
const SIZES = "(min-width: 1024px) 46vw, 100vw";

/** The whole wipe, including the last strip's delay. */
const WIPE_TOTAL_MS = (WIPE_S + STRIP_STAGGER_S * (STRIPS - 1)) * 1000;

export function HeroWork({ items, viewLabel }: Props) {
  const reduced = useReducedMotion() ?? false;
  const n = items.length;
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // The dots and the bar follow where we are going, not where we have been.
  const target = incoming ?? current;

  const go = useCallback(
    (next: number) => {
      const i = ((next % n) + n) % n;
      setIncoming((live) => (live !== null || i === current ? live : i));
    },
    [current, n],
  );

  // A hidden tab holds too: coming back to a card that moved three times
  // while nobody watched reads as a glitch.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const running = !reduced && n > 1 && !held && visible && incoming === null;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(current + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [running, current, go]);

  // Commit when the wipe is done. A timer rather than the last strip's
  // onAnimationComplete: if the tab is backgrounded mid-wipe the callback may
  // never arrive, and the card would stick half-swapped.
  useEffect(() => {
    if (incoming === null) return;
    if (reduced) { setCurrent(incoming); setIncoming(null); return; }
    const t = window.setTimeout(() => { setCurrent(incoming); setIncoming(null); }, WIPE_TOTAL_MS + 40);
    return () => window.clearTimeout(t);
  }, [incoming, reduced]);

  // The load screen waits on this card: the page is not whole until the first
  // picture is actually drawn. An error counts as done — a missing image must
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

  // Only the showing card is in the DOM, so the next picture would start
  // loading at the moment it is needed and wipe in half-drawn. Fetch the rest
  // once the first is up, at idle, picking the same srcset candidate.
  useEffect(() => {
    if (n < 2) return;
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      for (const p of items.slice(1)) {
        const img = new Image();
        img.sizes = SIZES;
        img.srcset = p.cover.srcSet;
        img.src = p.cover.src;
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(warm) : window.setTimeout(warm, 1200);
    return () => { cancelled = true; if (!w.requestIdleCallback) window.clearTimeout(id); };
  }, [items, n]);

  const strips = useMemo(() => Array.from({ length: STRIPS }, (_, i) => i), []);

  if (n === 0) return null;
  const shown = items[current];
  const next = incoming === null ? null : items[incoming];

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
      <div aria-live="polite" aria-atomic="true">
        <Link href={`/work/${shown.slug}`} className="hero-work-card group" aria-label={`${shown.title} — ${viewLabel}`}>
          <span className="hero-work-shot">
            <img
              src={shown.cover.src}
              srcSet={shown.cover.srcSet}
              sizes={SIZES}
              alt={shown.cover.alt}
              width={1600}
              height={900}
              decoding="async"
              onLoad={ready}
              onError={ready}
              className="hero-work-img"
              style={shown.cover.blurDataUrl ? { backgroundImage: `url(${shown.cover.blurDataUrl})`, backgroundSize: "cover" } : undefined}
            />
            {/* The incoming picture, cut into columns that uncover in turn. Each
                column holds the whole picture pushed back by its own offset, so
                the scale settles around one centre and the columns stay in
                register. */}
            {next ? (
              <span aria-hidden="true" className="hero-work-wipe">
                {strips.map((i) => (
                  <motion.span
                    key={i}
                    className="hero-work-strip"
                    style={{ left: `${(i * 100) / STRIPS}%`, width: `${100 / STRIPS}%` }}
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{ duration: WIPE_S, ease: EASE, delay: i * STRIP_STAGGER_S }}
                  >
                    <motion.span
                      className="hero-work-strip-inner"
                      style={{ left: `-${i * 100}%`, width: `${STRIPS * 100}%` }}
                      initial={{ scale: ZOOM_FROM }}
                      animate={{ scale: 1 }}
                      transition={{ duration: ZOOM_S, ease: EASE }}
                    >
                      <img src={next.cover.src} srcSet={next.cover.srcSet} sizes={SIZES} alt="" decoding="async" className="hero-work-img" />
                    </motion.span>
                  </motion.span>
                ))}
              </span>
            ) : null}
          </span>
          <motion.span
            key={shown.slug}
            className="hero-work-body"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
          >
            {shown.category ? <span className="hero-work-cat">{shown.category}</span> : null}
            <span className="hero-work-title">{shown.title}</span>
            {shown.metric ? (
              <span className="hero-work-metric">
                <b className="data">{shown.metric.value}</b> {shown.metric.label}
              </span>
            ) : null}
          </motion.span>
        </Link>
      </div>

      {n > 1 ? (
        <div className="hero-work-foot">
          {/* The bar restarts with the card; holding it pauses the animation
              rather than resetting it, so the pointer leaving carries on. */}
          <span className="hero-work-bar" aria-hidden="true">
            <i key={current} data-held={held || !visible || reduced || incoming !== null ? "true" : "false"} style={{ animationDuration: `${ADVANCE_MS}ms` }} />
          </span>
          <div className="hero-work-dots" role="tablist" aria-label={viewLabel}>
            {items.map((p, k) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={k === target}
                aria-label={p.title}
                className={cx("hero-work-dot", k === target && "is-on")}
                onClick={() => go(k)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
