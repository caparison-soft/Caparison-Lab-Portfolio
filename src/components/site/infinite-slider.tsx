"use client";
// Client component: an endless horizontal marquee (owner-supplied
// ibelick/infinite-slider, 2026-09-14, rebuilt on motion without
// react-use-measure). Children render twice and the track scrolls by half
// its width on a loop; hovering eases to the slower duration. Reduced
// motion shows the children once, static and wrapped.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";

type Props = { children: ReactNode; gap?: number; duration?: number; durationOnHover?: number; reverse?: boolean; className?: string };

export function InfiniteSlider({ children, gap = 16, duration = 25, durationOnHover, reverse = false, className }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(duration);
  const [transitioning, setTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || width === 0) return;
    const size = width + gap;
    const from = reverse ? -size / 2 : 0;
    const to = reverse ? 0 : -size / 2;
    const controls = transitioning
      ? animate(x, [x.get(), to], { ease: "linear", duration: current * Math.abs((x.get() - to) / size), onComplete: () => { setTransitioning(false); setKey((k) => k + 1); } })
      : animate(x, [from, to], { ease: "linear", duration: current, repeat: Infinity, repeatType: "loop", repeatDelay: 0, onRepeat: () => x.set(from) });
    return () => controls.stop();
  }, [key, x, current, width, gap, transitioning, reverse, reduced]);

  if (reduced) {
    return <div className={cx("flex flex-wrap", className)} style={{ gap }}>{children}</div>;
  }

  const hover = durationOnHover
    ? { onHoverStart: () => { setTransitioning(true); setCurrent(durationOnHover); }, onHoverEnd: () => { setTransitioning(true); setCurrent(duration); } }
    : {};

  return (
    <div className={cx("overflow-hidden", className)}>
      <motion.div ref={ref} className="flex w-max" style={{ x, gap }} {...hover}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}
