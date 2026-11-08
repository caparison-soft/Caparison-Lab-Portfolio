"use client";
// Client component: moves its children with the page scroll for a little
// depth (useScroll + useTransform). For elements that start in the first
// screen: the offset is 0 while the element sits where it was rendered and
// reaches `distance` px once the element has scrolled out of view, so the
// server render and the first client frame agree. Reduced motion: it stays put.

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export function Parallax({ children, distance = -60, className }: { children: ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, (v) => (reduced ? 0 : v * distance));
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
