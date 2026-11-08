"use client";
// Client component: an endless row that drifts on its own and speeds up (and
// reverses) with the page's scroll velocity. The children are rendered twice
// so the loop has no seam. Reduced motion: a still row.

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef, type ReactNode } from "react";

function wrap(min: number, max: number, v: number) {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
}

export function VelocityMarquee({ children, speed = 2, className }: { children: ReactNode; speed?: number; className?: string }) {
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const sign = speed < 0 ? -1 : 1;
  const dir = useRef(sign);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const f = factor.get();
    // Scrolling up runs the row backwards; scrolling down restores it.
    if (f < 0) dir.current = -sign;
    else if (f > 0) dir.current = sign;
    base.set(base.get() + dir.current * Math.abs(speed) * (1 + Math.abs(f)) * (delta / 1000));
  });

  return (
    <div className={`cl-marquee ${className ?? ""}`}>
      <motion.div className="cl-marquee-track" style={{ x }}>
        <span className="inline-flex items-center">{children}</span>
        <span className="inline-flex items-center" aria-hidden="true">{children}</span>
      </motion.div>
    </div>
  );
}
