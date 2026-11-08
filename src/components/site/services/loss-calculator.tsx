"use client";
// Client component: two sliders (missed calls a week, average job) and the
// yearly sum they add up to. Needs state for the inputs; the figure glides to
// its new value on a spring. Screen readers get the settled figure through a
// polite live region, not every frame of the glide. Reduced motion: no glide.

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useState } from "react";
import { vars } from "@/components/motion/split";

type Labels = { heading: string; calls: string; value: string; currency: string; result: string; note: string };

const CALLS = { min: 1, max: 20, step: 1, start: 3 };
const VALUE = { min: 100, max: 3000, step: 50, start: 350 };

function money(currency: string, n: number) {
  return `${currency}${Math.round(n).toLocaleString("en-US")}`;
}

export function LossCalculator({ labels }: { labels: Labels }) {
  const id = useId();
  const reduced = useReducedMotion();
  const [calls, setCalls] = useState(CALLS.start);
  const [value, setValue] = useState(VALUE.start);
  const total = (calls * 52 * value) / 2;
  const spring = useSpring(total, { stiffness: 90, damping: 22 });
  const shown = useTransform(spring, (v) => money(labels.currency, v));

  useEffect(() => {
    if (reduced) spring.jump(total);
    else spring.set(total);
  }, [spring, total, reduced]);

  const fill = (v: number, r: { min: number; max: number }) => `${((v - r.min) / (r.max - r.min)) * 100}%`;

  return (
    <div className="ind-calc cl-card cl-spot">
      <p className="ind-calc-heading">{labels.heading}</p>
      <div className="ind-calc-field">
        <div className="ind-calc-row">
          <label htmlFor={`${id}-calls`}>{labels.calls}</label>
          <output htmlFor={`${id}-calls`} className="data ind-calc-val">{calls}</output>
        </div>
        <input
          id={`${id}-calls`}
          type="range"
          min={CALLS.min}
          max={CALLS.max}
          step={CALLS.step}
          value={calls}
          onChange={(e) => setCalls(Number(e.target.value))}
          className="ind-range"
          style={vars({ "--fill": fill(calls, CALLS) })}
        />
      </div>
      <div className="ind-calc-field">
        <div className="ind-calc-row">
          <label htmlFor={`${id}-value`}>{labels.value}</label>
          <output htmlFor={`${id}-value`} className="data ind-calc-val">{money(labels.currency, value)}</output>
        </div>
        <input
          id={`${id}-value`}
          type="range"
          min={VALUE.min}
          max={VALUE.max}
          step={VALUE.step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="ind-range"
          style={vars({ "--fill": fill(value, VALUE) })}
        />
      </div>
      <div className="ind-calc-result">
        <p className="ind-calc-result-label">{labels.result}</p>
        <p className="ind-calc-figure">
          <span className="sr-only" aria-live="polite">{money(labels.currency, total)}</span>
          <motion.span aria-hidden="true">{shown}</motion.span>
        </p>
      </div>
      <p className="ind-calc-note">{labels.note}</p>
    </div>
  );
}
