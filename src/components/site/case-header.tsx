"use client";
// Client component: the case-page header (owner's brief, 2026-09-15; light
// redesign 2026-11-05). Two columns: category and kind chips, title (letters
// rise in one by one) with the live-site button beside it, summary, role and
// platform chips on the left; a dark facts card on the right with the client
// logo and the numbers, which count up when the card enters view. One
// choreographed load sequence; reduced motion renders everything in place.

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cx } from "@/lib/cx";
import { CtaButton } from "@/components/site/cta-button";

export type Fact =
  | { kind: "money"; label: string; symbol: string; min: number; max: number | null; display?: string | null }
  | { kind: "count"; label: string; value: number; unit?: string; display?: string | null }
  | { kind: "date"; label: string; iso: string }
  | { kind: "text"; label: string; value: string; dot?: boolean };

type Props = {
  category: string | null;
  kind: "CLIENT" | "INTERNAL" | "CONCEPT";
  /** Null when the kind banner above already says it. */
  kindLabel: string | null;
  title: string;
  summary: string;
  outcome: string | null;
  client: { name: string | null; logoUrl: string | null };
  pills: string[];
  facts: Fact[];
  live: { href: string; label: string } | null;
  labels: { client: string; facts: string };
};

const EASE = [0.16, 1, 0.3, 1] as const;

function k(n: number): string {
  if (n >= 1000) { const v = n / 1000; return `${Number.isInteger(v) ? v : v.toFixed(1)}k`; }
  return String(n);
}

/** A number that ticks from 0 to its value the first time it is seen. */
function Counter({ to, render, run }: { to: number; render: (n: number) => string; run: boolean }) {
  const [n, setN] = useState(run ? 0 : to);
  useEffect(() => {
    if (!run) { setN(to); return; }
    const c = animate(0, to, { duration: 0.9, ease: EASE, onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [to, run]);
  return <>{render(n)}</>;
}

function FactValue({ f, run }: { f: Fact; run: boolean }) {
  switch (f.kind) {
    case "money":
      if (f.display) return <>{f.display}</>;
      return (
        <>
          {f.symbol}<Counter to={f.min} run={run} render={(n) => k(Math.round(n))} />
          {f.max != null ? <> – <Counter to={f.max} run={run} render={(n) => k(Math.round(n))} /></> : null}
        </>
      );
    case "count":
      if (f.display) return <>{f.display}</>;
      return <><Counter to={f.value} run={run} render={(n) => String(Math.round(n))} />{f.unit ? ` ${f.unit}` : ""}</>;
    case "date": {
      const d = new Date(f.iso);
      const target = d.getFullYear() * 12 + d.getMonth();
      return <Counter to={target} run={run} render={(n) => { const m = Math.round(n); return new Date(Math.floor(m / 12), m % 12, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" }); }} />;
    }
    case "text":
      return <>{f.dot ? <span aria-hidden="true" className="inline-block w-[8px] h-[8px] rounded-full bg-lime mr-1 align-middle" /> : null}<span className={f.dot ? "text-lime" : undefined}>{f.value}</span></>;
  }
}

export function CaseHeader({ category, kind, kindLabel, title, summary, outcome, client, pills, facts, live, labels }: Props) {
  const reduced = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.4 });
  const run = !reduced && inView;

  // 3D tilt: the card leans toward the pointer (up to 8 degrees), a sheen
  // follows it, and the inner content sits forward in depth. Springs back
  // on leave. No tilt under reduced motion.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 22 });
  const sy = useSpring(py, { stiffness: 180, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-8, 8]);
  const rotateX = useTransform(sy, [0, 1], [8, -8]);
  const sheenX = useTransform(sx, [0, 1], [0, 100]);
  const sheenY = useTransform(sy, [0, 1], [0, 100]);
  const sheen = useMotionTemplate`radial-gradient(60% 50% at ${sheenX}% ${sheenY}%, rgb(236 238 232 / 0.10), transparent 70%)`;
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };
  const t = (delay: number) => (reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay });
  const words = title.split(" ");
  let n = 0;

  return (
    <header className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] gap-4 lg:gap-6 items-start">
      <div className="min-w-0">
        <motion.div initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={t(0)} className="flex flex-wrap items-center gap-1">
          {kindLabel ? <span className={cx("cl-chip", kind === "CONCEPT" && "cl-chip--lime", kind === "INTERNAL" && "cl-chip--ink")}>{kindLabel}</span> : null}
          {category ? <span className="cl-chip">{category}</span> : null}
        </motion.div>
        {/* The live site is what a visitor most wants from this page, so the
            button sits beside the title rather than trailing the metadata
            (owner, 2026-09-19). It is inside the heading, so it follows the
            last word wherever the title wraps instead of being pushed onto a
            line of its own by a flex row (owner, 2026-09-19). The letters are
            hidden from assistive tech and the plain title is read instead, so
            the link keeps its own name inside the heading. */}
        <h1 className="mt-3 text-display-xl">
          {reduced ? title : <span className="sr-only">{title}</span>}
          {reduced ? null : words.map((w, wi) => (
            <span key={wi} className={cx("inline-block whitespace-nowrap", wi < words.length - 1 && "mr-[0.25em]")} aria-hidden="true">
              {w.split("").map((ch) => {
                const i = n++;
                return (
                  // display-l has line-height 1, so the mask box ends at the
                  // baseline and overflow-hidden cut the tail off every y and g
                  // (owner, 2026-09-16). The padding grows the clip box down
                  // past the descender and the negative margin puts the bottom
                  // margin edge back where align-bottom expects it, so the
                  // layout is unchanged.
                  <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.22em] -mb-[0.22em]">
                    <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.025 }}>{ch}</motion.span>
                  </span>
                );
              })}
            </span>
          ))}
          {live ? (
            <motion.span initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.5)} className="inline-flex align-middle ml-[0.25em] tracking-normal">
              <CtaButton href={live.href} external variant="ink" size="sm">{live.label}</CtaButton>
            </motion.span>
          ) : null}
        </h1>
        <motion.p initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.35)} className="mt-3 text-body-l text-ash max-w-[52ch]">{summary}</motion.p>
        {outcome ? <motion.p initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.45)} className="mt-3 text-h3 font-bold text-ink max-w-[40ch] leading-tight">{outcome}</motion.p> : null}
        {pills.length > 0 ? (
          <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.6)} className="mt-4 flex flex-wrap items-center gap-1">
            {pills.map((p) => <span key={p} className="cl-chip">{p}</span>)}
          </motion.div>
        ) : null}
      </div>

      <motion.div initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={t(0.5)} style={{ perspective: 1000 }}>
      <motion.aside
        ref={cardRef}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="wk-facts on-dark p-3 md:p-4"
        aria-label={labels.facts}
      >
        {/* Sheen that follows the pointer, and a faint inner edge for the top face. */}
        {!reduced ? <motion.span aria-hidden="true" className="pointer-events-none inset-0 rounded-[24px]" style={{ position: "absolute", background: sheen }} /> : null}
        <span aria-hidden="true" className="pointer-events-none absolute top-0 left-[32px] right-[32px] h-[1px] bg-gradient-to-r from-transparent via-lime/70 to-transparent" />
        <div style={reduced ? undefined : { transform: "translateZ(24px)" }}>
        {client.name || client.logoUrl ? (
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
            {client.logoUrl ? <img src={client.logoUrl} alt="" className="h-[28px] w-auto max-w-[140px] object-contain" loading="eager" decoding="async" /> : null}
            <div className="min-w-0">
              <p className="text-small text-sage max-w-none">{labels.client}</p>
              {client.name ? <p className="text-body font-medium text-bone max-w-none truncate">{client.name}</p> : null}
            </div>
          </div>
        ) : null}
        <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-3">
          {facts.map((f, i) => (
            <div key={i} className={cx("min-w-0", f.kind === "text" && f.value.length > 18 && "col-span-2")}>
              <dt>{f.label}</dt>
              <dd className="data m-0 mt-[2px] text-h4 tabular-nums leading-tight"><FactValue f={f} run={run} /></dd>
            </div>
          ))}
        </dl>
        </div>
      </motion.aside>
      </motion.div>
    </header>
  );
}
