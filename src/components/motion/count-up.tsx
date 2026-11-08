"use client";
// Client component: counts a figure up from zero the first time it is seen.
// Anything around the number ("$", "+", " days") is kept as is. Reduced
// motion, or a value with no number in it, renders the final text. The first
// render never reads useReducedMotion (null on the server, true on a reduced
// client, which was a hydration mismatch); the effect swaps in the final text.

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, className, duration = 1.6 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : NaN;
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    if (!inView || !match || Number.isNaN(target)) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(`${match[1]}${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${match[3]}`),
    });
    return () => controls.stop();
    // match is derived from value; value is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown ?? (!match ? value : `${match[1]}0${match[3]}`)}</span>
    </span>
  );
}
