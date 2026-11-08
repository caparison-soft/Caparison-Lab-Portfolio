"use client";
// Client component: a large hexagon outline behind the closing offer that
// turns with the scroll and leans toward the pointer. Decorative only.

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function SpinningHex() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-30, 60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.85, 1, 1.1]);
  return (
    <div ref={ref} aria-hidden="true" className="closing-hex">
      <motion.svg viewBox="0 0 100 100" style={{ rotate, scale }}>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
        <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="none" stroke="currentColor" strokeWidth="0.4" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="0.4" />
      </motion.svg>
    </div>
  );
}
