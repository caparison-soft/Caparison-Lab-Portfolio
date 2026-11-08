"use client";
// Client component: the process steps with a line that fills as you scroll
// through them (useScroll on the list), and each step's node lighting up once
// the line reaches it. Reduced motion: the line is drawn and every node lit.

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type TimelineStep = { title: string; description: string; duration: string | null };

export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const prefersReduced = useReducedMotion();
  // Read after mount: the server cannot know the preference, and React does
  // not patch a mismatched attribute on hydration.
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(Boolean(prefersReduced)), [prefersReduced]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const ol = ref.current;
    if (!ol) return;
    const h = ol.offsetHeight || 1;
    let n = -1;
    Array.from(ol.children).forEach((li, i) => {
      if (((li as HTMLElement).offsetTop + 16) / h <= v + 0.001) n = i;
    });
    setReached(n);
  });

  return (
    <div className="sv-steps-wrap">
      <div className="sv-steps-track" aria-hidden="true">
        <motion.div className="sv-steps-fill" style={reduced ? { scaleY: 1 } : { scaleY }} />
      </div>
      <ol ref={ref} className="sv-steps">
        {steps.map((s, i) => (
          <li key={s.title} className="sv-step" data-reached={reduced || i <= reached ? "true" : "false"}>
            <span className="sv-step-node" aria-hidden="true" />
            <div className="sv-step-meta">
              <span className="data">{String(i + 1).padStart(2, "0")}</span>
              {s.duration ? <span className="data sv-step-when">{s.duration}</span> : null}
            </div>
            <h3 className="sv-step-title">{s.title}</h3>
            <p className="sv-step-text">{s.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
