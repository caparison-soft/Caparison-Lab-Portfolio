"use client";
// Client component: the process as a row of steps joined by a line that fills
// as the section scrolls past; each step lights (lime node) once the line
// reaches it. Under lg the line runs down the left. Reduced motion: the line
// is drawn and every step is lit.

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ProcessItem } from "@/lib/queries/home";

export function ProcessLine({ steps }: { steps: ProcessItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const fill = useTransform(progress, (v) => (reduced ? 1 : v));
  const [reached, setReached] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setReached(Math.floor(v * steps.length + 0.15)));
  const lit = reduced ? steps.length : reached;
  const [horizontal, setHorizontal] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setHorizontal(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <ol ref={ref} className="process-line list-none m-0" style={{ ["--n" as string]: steps.length }}>
      <span className="process-track" aria-hidden="true">
        <motion.span className="process-fill" style={horizontal ? { scaleX: fill } : { scaleY: fill }} />
      </span>
      {steps.map((s, i) => (
        <li key={s.title} className="process-step" data-lit={i < lit}>
          <span className="process-node" aria-hidden="true" />
          {s.duration ? <p className="data text-ash mt-2">{s.duration}</p> : null}
          <h3 className="text-h3 mt-1">{s.title}</h3>
          <p className="mt-1 text-body text-ash">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}
