"use client";
// Client component: the steps side by side on one line. On wide screens the
// section is tall and its inside sticks to the screen, so the scroll drives
// the Leaf fill from the first step to the last before the page moves on
// (owner, 2026-11-08: "finish the path, then scroll"); each number lights as
// the fill reaches it. Phones keep a short section with a sideways row, the
// fill following the scroll past it. Motion values go in style, so server and
// client markup match; reduced motion (CSS) unpins and shows the line full.

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProcessItem } from "@/lib/queries/home";

export function ProcessBlackRow({ steps, labelledBy, children }: { steps: ProcessItem[]; labelledBy: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const wide = useRef(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const set = () => { wide.current = mq.matches; };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Pinned: the whole scroll through the section. Phones: the row passing through.
  const { scrollYProgress: pinned } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: passing } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  // The fill is complete a little before the pin lets go, so the last step is seen lit.
  const raw = useTransform([pinned, passing], ([p, q]: number[]) => (wide.current ? Math.min(1, p / 0.8) : q));
  const fill = useSpring(raw, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(-1);
  const n = steps.length;
  useMotionValueEvent(fill, "change", (v) => {
    const at = n > 1 ? v * (n - 1) : v >= 0.5 ? 0 : -1;
    const next = Math.min(n - 1, Math.floor(at + 0.02));
    setReached((r) => (r === next ? r : next));
  });

  return (
    <section ref={ref} className="hbr-section" aria-labelledby={labelledBy}>
      <div className="hbr-pin">
        <div className="max-w-layout mx-auto w-full">
          {children}
          <div className="hbr" style={{ ["--n" as string]: n }}>
            {/* Scrolls sideways on phones, so it takes keyboard focus there. */}
            <div className="hbr-scroll" role="group" aria-labelledby={labelledBy} tabIndex={0}>
              <ol className="hbr-list">
                <span className="hbr-track" aria-hidden="true">
                  <motion.span className="hbr-fill" style={{ scaleX: fill }} />
                </span>
                {steps.map((s, i) => (
                  <li key={s.title} className="hbr-step" data-lit={i <= reached}>
                    <span className="hbr-node" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    {s.duration ? <p className="hbr-when">{s.duration}</p> : null}
                    <h3 className="hbr-title">{s.title}</h3>
                    <p className="hbr-desc">{s.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
