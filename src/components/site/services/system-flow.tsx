"use client";
// Client component: "the system we set up" as a step flow. On lg+ the section
// pins while you scroll through it (useScroll on the tall wrapper), the step in
// view opens in the list and the screen on the right swaps to what the customer
// or the owner sees at that step; clicking a step scrolls to it. Below lg the
// steps stack, each with its own small screen, and reveal as they enter.
// Reduced motion keeps the pinning (it is driven by the reader's own scroll)
// but the screens swap without movement.

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { vars } from "@/components/motion/split";
import { cx } from "@/lib/cx";

export type FlowStep = { title: string; body: string; screen: string; time: string };
type Labels = { business: string; customer: string; step: string; booked: string; reviewLink: string; reply: string; caption: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function SystemFlow({ steps, labels }: { steps: FlowStep[]; labels: Labels }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const n = steps.length;
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });

  const goTo = (i: number) => {
    const el = outerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / n) * (el.offsetHeight - window.innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: reduced ? 0 : 1 });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };

  const step = steps[active];

  return (
    <div ref={outerRef} className="ind-flow" data-pinned={pinned ? "true" : "false"} style={vars({ "--n": n })}>
      <div className="ind-flow-stage">
        <div className="ind-flow-list-wrap">
          {pinned ? (
            <div className="ind-flow-track" aria-hidden="true">
              <motion.div className="ind-flow-fill" style={{ scaleY: scrollYProgress }} />
            </div>
          ) : null}
          <ol className="ind-flow-steps" data-reveal={pinned ? undefined : "stagger"}>
            {steps.map((s, i) => {
              const on = !pinned || i === active;
              return (
                <li key={s.title} className="ind-flow-step" data-active={on ? "true" : "false"} data-done={pinned && i < active ? "true" : "false"}>
                  {pinned ? (
                    <button type="button" className="ind-flow-btn" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined}>
                      <span className="data ind-flow-num">{pad(i + 1)}</span>
                      <span className="ind-flow-title">{s.title}</span>
                    </button>
                  ) : (
                    <h3 className="ind-flow-btn">
                      <span className="data ind-flow-num">{pad(i + 1)}</span>
                      <span className="ind-flow-title">{s.title}</span>
                    </h3>
                  )}
                  <div className="ind-flow-body" inert={!on}>
                    <div>
                      <p className="ind-flow-text">{s.body}</p>
                      {!pinned ? (
                        <div className="ind-flow-mini" aria-hidden="true">
                          <Screen index={i} step={s} labels={labels} total={n} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {!pinned ? <p className="ind-flow-caption">{labels.caption}</p> : null}
        </div>

        {pinned && step ? (
          <div className="ind-flow-panel" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="ind-flow-panel-inner"
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: reduced ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <Screen index={active} step={step} labels={labels} total={n} large />
              </motion.div>
            </AnimatePresence>
            <div className="ind-flow-dots">
              {steps.map((s, i) => (
                <span key={s.title} data-on={i <= active ? "true" : "false"} />
              ))}
            </div>
            <p className="ind-flow-caption">{labels.caption}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** What the screen shows at one step. Pictures follow the order of the seven steps. */
function Screen({ index, step, labels, total, large }: { index: number; step: FlowStep; labels: Labels; total: number; large?: boolean }) {
  let body: ReactNode;
  switch (index) {
    case 0:
      body = (
        <>
          <div className="ind-scr-search">
            <SearchIcon />
            <span>{step.screen}</span>
          </div>
          <div className="ind-scr-result ind-scr-hi">
            <span className="ind-scr-strong">{labels.business}</span>
            <Stars n={5} />
            <span className="ind-scr-bar w-[70%]" />
          </div>
          <div className="ind-scr-result">
            <span className="ind-scr-bar ind-scr-bar--dark w-[46%]" />
            <span className="ind-scr-bar w-[80%]" />
          </div>
          <div className="ind-scr-result">
            <span className="ind-scr-bar ind-scr-bar--dark w-[38%]" />
            <span className="ind-scr-bar w-[64%]" />
          </div>
        </>
      );
      break;
    case 1:
      body = (
        <>
          <div className="ind-scr-site-bar">
            <span className="ind-scr-strong">{labels.business}</span>
            <span className="ind-scr-call"><PhoneIcon /></span>
          </div>
          <span className="ind-scr-bar ind-scr-bar--dark ind-scr-bar--h w-[86%]" />
          <span className="ind-scr-bar ind-scr-bar--dark ind-scr-bar--h w-[62%]" />
          <span className="ind-scr-bar w-[74%]" />
          <span className="ind-scr-bar w-[58%]" />
          <span className="ind-scr-button">{step.screen}</span>
          <div className="ind-scr-photo" />
        </>
      );
      break;
    case 2:
      body = (
        <>
          <span className="ind-scr-strong">{labels.customer}</span>
          <div className="ind-scr-field">{step.screen}</div>
          <div className="ind-scr-field ind-scr-field--short"><span className="ind-scr-bar w-[60%]" /></div>
          <div className="ind-scr-attach">
            <div className="ind-scr-thumb" />
            <span className="ind-scr-bar w-[40%]" />
          </div>
          <span className="ind-scr-send"><ArrowIcon /></span>
        </>
      );
      break;
    case 3:
      body = (
        <div className="ind-scr-thread">
          <span className="ind-scr-who">{labels.business}</span>
          <p className="ind-scr-bubble ind-scr-bubble--out">{step.screen}</p>
          <p className="ind-scr-bubble ind-scr-bubble--in">{labels.reply}</p>
        </div>
      );
      break;
    case 4:
      body = (
        <>
          <div className="ind-scr-cal">
            {Array.from({ length: 21 }, (_, i) => (
              <span key={i} data-on={i === 8 ? "true" : undefined} />
            ))}
          </div>
          <div className="ind-scr-booked">
            <span className="ind-scr-chip">{labels.booked}</span>
            <span className="data">{step.screen}</span>
          </div>
          <span className="ind-scr-strong">{labels.customer}</span>
        </>
      );
      break;
    case 5:
      body = (
        <>
          <div className="ind-scr-route">
            <svg viewBox="0 0 240 90" fill="none" focusable="false">
              <path d="M16 70C60 70 70 24 120 30s70 36 104 14" className="ind-scr-path" />
              <circle cx="16" cy="70" r="6" className="ind-scr-from" />
              <path d="M224 46c0 0-10-10-10-17a10 10 0 1 1 20 0c0 7-10 17-10 17z" className="ind-scr-pin" />
            </svg>
          </div>
          <div className="ind-scr-job">
            <span className="ind-scr-strong">{step.screen}</span>
            <span className="ind-scr-bar w-[70%]" />
            <span className="ind-scr-bar w-[50%]" />
          </div>
          <div className="ind-scr-attach">
            <div className="ind-scr-thumb" />
            <span className="ind-scr-bar w-[46%]" />
          </div>
        </>
      );
      break;
    default:
      body = (
        <div className="ind-scr-thread">
          <span className="ind-scr-who">{labels.business}</span>
          <p className="ind-scr-bubble ind-scr-bubble--out">{step.screen}</p>
          <div className="ind-scr-review">
            <Stars n={5} animate />
            <span className="ind-scr-button">{labels.reviewLink}</span>
          </div>
        </div>
      );
  }

  return (
    <div className={cx("ind-scr", large && "ind-scr--large")}>
      <div className="ind-scr-head">
        <span className="data">{labels.step} {pad(index + 1)}/{pad(total)}</span>
        <span className="data">{step.time}</span>
      </div>
      <div className="ind-scr-body">{body}</div>
    </div>
  );
}

function Stars({ n, animate }: { n: number; animate?: boolean }) {
  return (
    <span className={cx("ind-scr-stars", animate && "ind-scr-stars--fill")}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" style={vars({ "--i": i })} focusable="false">
          <path d="M8 1.5l1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1l-3.9 2.2.9-4.3-3.3-3 4.4-.5z" />
        </svg>
      ))}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" focusable="false" className="ind-scr-icon">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" focusable="false" className="ind-scr-icon">
      <path d="M4 2h2.5l1 3-1.5 1a8 8 0 0 0 4 4l1-1.5 3 1V12a2 2 0 0 1-2 2A10 10 0 0 1 2 4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" focusable="false" className="ind-scr-icon">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
