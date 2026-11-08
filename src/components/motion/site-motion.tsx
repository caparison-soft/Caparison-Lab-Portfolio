"use client";
// Client component: motion settings for the public site. reducedMotion "user"
// turns every transform animation off when the visitor asks for less motion.

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function SiteMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
