"use client";
// Client component: the hero's motion graphic. A made-up plumbing company's
// evening plays out as live UI: a job request arrives from the website, a text
// goes back on its own, the customer replies, the slot is booked, the week's
// count ticks up and a review request is queued. It loops while on screen and
// pauses when scrolled away or the tab is hidden. The whole stack tilts toward
// the pointer. Reduced motion shows the finished state, still.

import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type DemoCopy = {
  business: string;
  caption: string;
  reqLabel: string;
  reqTitle: string;
  reqName: string;
  reqPlace: string;
  reqTime: string;
  reqSource: string;
  smsLabel: string;
  smsOut: string;
  smsIn: string;
  bookLabel: string;
  bookValue: string;
  statsLabel: string;
  statsValue: string;
  statsNote: string;
  reviewLabel: string;
  reviewNote: string;
};

/** Milliseconds from the start of a loop at which each step lands. */
const STEPS = [500, 1500, 2700, 3700, 4500, 5300, 6300];
const LOOP = 10_000;
const W = 540;
const H = 580;

const spring = { type: "spring", stiffness: 260, damping: 24, mass: 0.8 } as const;
const enter = { initial: { opacity: 0, y: 18, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.35 } }, transition: spring };

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const WRENCH = "M12.5 3.5a3.5 3.5 0 0 0-3.3 4.6l-5.4 5.4a1.4 1.4 0 0 0 2 2l5.4-5.4a3.5 3.5 0 0 0 4.6-3.3l-2 1.2-1.9-1.1V4.8l1.7-1Z";
const CHAT = "M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3h0A1.5 1.5 0 0 1 4 11.5v-6Z";
const CHECK = "m5 10.5 3 3 7-7";
const CAL = "M5 4.5h10A1.5 1.5 0 0 1 16.5 6v8.5A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5ZM3.5 8.5h13M7 3v3M13 3v3";

function Star() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="w-[14px] h-[14px]">
      <path d="M8 1.5l1.9 4 4.4.5-3.3 3 .9 4.4L8 11.2l-3.9 2.2.9-4.4-3.3-3 4.4-.5L8 1.5Z" fill="currentColor" />
    </svg>
  );
}

export function LeadFlowDemo({ copy }: { copy: DemoCopy }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "-10% 0px -10% 0px" });
  // Starts empty on the server and the client alike; the effect below jumps
  // straight to the end under reduced motion.
  const [step, setStep] = useState(0);
  const [scale, setScale] = useState(1);
  const finalCount = Number.parseInt(copy.statsValue, 10);
  const startCount = Number.isNaN(finalCount) ? null : finalCount - 1;

  // Fit the fixed 540 x 580 composition into whatever width the column has.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The loop: schedule each step, then start over. Paused off screen or hidden.
  useEffect(() => {
    if (reduced) {
      setStep(STEPS.length);
      return;
    }
    if (!inView) return;
    let timers: number[] = [];
    const run = () => {
      setStep(0);
      timers = STEPS.map((t, i) => window.setTimeout(() => setStep(i + 1), t));
      timers.push(window.setTimeout(run, LOOP));
    };
    const clear = () => timers.forEach((t) => window.clearTimeout(t));
    const onVis = () => {
      clear();
      if (!document.hidden) run();
    };
    run();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clear();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [inView, reduced]);

  // Tilt toward the pointer anywhere over the hero.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-1, 1], [7, -7]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(px, [-1, 1], [-9, 9]), { stiffness: 120, damping: 20 });
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, px, py]);

  const show = (n: number) => step >= n;
  const count = startCount === null ? copy.statsValue : String(show(6) ? finalCount : startCount);
  // Seven bars for the week; the last grows when the new job lands.
  const bars = [38, 52, 44, 66, 58, 74, show(6) ? 92 : 70];

  return (
    <figure className="m-0">
      <div ref={wrapRef} className="lf-wrap" style={{ height: H * scale }} aria-hidden="true">
        <motion.div className="lf-stage" style={{ width: W, height: H, scale, rotateX: rx, rotateY: ry, transformOrigin: "0 0" }}>
          {/* The dashboard the cards float over. */}
          <div className="lf-base">
            <div className="lf-base-head">
              <span className="lf-base-mark" />
              <span className="text-bone font-bold text-small">{copy.business}</span>
              <span className="ml-auto data text-sage">{copy.reqTime}</span>
            </div>
            <div className="lf-base-grid" />
            <div className="lf-bars">
              {bars.map((h, i) => (
                <motion.span key={i} className={i === bars.length - 1 ? "lf-bar lf-bar-now" : "lf-bar"} animate={{ height: `${h}%` }} transition={spring} />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {show(1) ? (
              <motion.div key="req" className="lf-card lf-req" {...enter} style={{ z: 60 }}>
                <div className="flex items-center gap-1">
                  <span className="lf-ico lf-ico-ink"><Icon d={WRENCH} /></span>
                  <span className="text-small font-bold">{copy.reqLabel}</span>
                  <span className="ml-auto data text-ash">{copy.reqTime}</span>
                </div>
                <p className="mt-[10px] text-h4 font-bold leading-tight tracking-[-0.02em]">{copy.reqTitle}</p>
                <div className="mt-[6px] flex items-center gap-1 text-small text-ash">
                  <span>{copy.reqName}</span>
                  <span className="lf-sep" />
                  <span>{copy.reqPlace}</span>
                </div>
                <span className="cl-chip cl-chip--lime mt-[12px]">{copy.reqSource}</span>
              </motion.div>
            ) : null}

            {show(2) ? (
              <motion.div key="sms" className="lf-card lf-sms" {...enter} style={{ z: 90 }}>
                <div className="flex items-center gap-1 text-small text-ash">
                  <span className="lf-ico"><Icon d={CHAT} /></span>
                  <span>{copy.smsLabel}</span>
                </div>
                <div className="mt-[10px] flex flex-col gap-[6px]">
                  <AnimatePresence mode="wait">
                    {show(3) ? (
                      <motion.p key="out" className="lf-bubble lf-bubble-out" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        {copy.smsOut}
                      </motion.p>
                    ) : (
                      <motion.p key="typing" className="lf-bubble lf-bubble-out lf-typing" exit={{ opacity: 0 }}>
                        <span />
                        <span />
                        <span />
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {show(4) ? (
                    <motion.p className="lf-bubble lf-bubble-in" initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}>
                      {copy.smsIn}
                    </motion.p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}

            {show(5) ? (
              <motion.div key="book" className="lf-card lf-book" {...enter} style={{ z: 120 }}>
                <span className="lf-ico lf-ico-lime"><Icon d={CHECK} /></span>
                <div>
                  <p className="text-small text-ash leading-none">{copy.bookLabel}</p>
                  <p className="mt-[6px] font-bold leading-none flex items-center gap-1">
                    <Icon d={CAL} className="w-[16px] h-[16px]" />
                    {copy.bookValue}
                  </p>
                </div>
              </motion.div>
            ) : null}

            {show(6) ? (
              <motion.div key="stats" className="lf-card lf-stats" {...enter} style={{ z: 70 }}>
                <p className="text-small text-ash">{copy.statsLabel}</p>
                <div className="flex items-end gap-1 mt-[4px]">
                  <AnimatePresence mode="popLayout">
                    <motion.span key={count} className="data lf-count" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={spring}>
                      {count}
                    </motion.span>
                  </AnimatePresence>
                  <span className="cl-chip cl-chip--lime mb-[6px] h-[24px] data">+1</span>
                </div>
                <p className="text-small text-ash mt-[2px]">{copy.statsNote}</p>
              </motion.div>
            ) : null}

            {show(7) ? (
              <motion.div key="review" className="lf-card lf-review" {...enter} style={{ z: 100 }}>
                <div className="flex gap-px text-olive-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span key={i} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...spring, delay: 0.08 * i }}>
                      <Star />
                    </motion.span>
                  ))}
                </div>
                <p className="mt-[8px] text-small font-bold leading-none">{copy.reviewLabel}</p>
                <p className="mt-[6px] text-small text-ash leading-none">{copy.reviewNote}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
      {/* The motion graphic is decorative; this sentence carries what it shows. */}
      <figcaption className="mt-2 text-small text-ash max-w-[46ch]">{copy.caption}</figcaption>
    </figure>
  );
}
