"use client";
// Client component: the single scroll-triggered reveal on the whole site,
// used on the first work-index row only. Skipped under reduced motion.

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function RevealRow({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      className={className}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.li>
  );
}
