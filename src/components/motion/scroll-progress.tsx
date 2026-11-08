"use client";
// Client component: the page's read progress as a hairline at the very top.

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div aria-hidden="true" className="cl-progress" style={{ scaleX }} />;
}
