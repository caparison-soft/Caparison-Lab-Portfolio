"use client";
// Client component: the steps hang off one thin vertical line. As the list
// scrolls through the viewport a Leaf fill runs down the line and each step's
// node lights when the fill reaches it. The fill is a motion value passed in
// style, so the server and client markup match; under reduced motion the CSS
// (home-black-sections.css) shows the line full and every node lit, still.

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import type { ProcessItem } from "@/lib/queries/home";

export function ProcessBlackSteps({ steps }: { steps: ProcessItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  // Progress is the share of the steps above a line 60% down the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(-1);
  useMotionValueEvent(fill, "change", (v) => {
    // A node lights once the fill has reached its centre.
    const box = ref.current;
    const nodes = list.current?.querySelectorAll<HTMLElement>(".hbp-node");
    if (!box || !nodes) return;
    const y = v * box.offsetHeight;
    let next = -1;
    nodes.forEach((n, i) => {
      if (n.offsetTop + n.offsetHeight / 2 <= y + 2) next = i;
    });
    setReached((r) => (r === next ? r : next));
  });

  return (
    <div ref={ref} className="hbp">
      <span className="hbp-track" aria-hidden="true">
        <motion.span className="hbp-fill" style={{ scaleY: fill }} />
      </span>
      <ol ref={list} className="list-none m-0 p-0">
        {steps.map((s, i) => (
          <li key={s.title} className="hbp-step" data-lit={i <= reached}>
            <span className="hbp-node" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="hbp-body" data-reveal="up">
              {s.duration ? <p className="data hb-sub text-small">{s.duration}</p> : null}
              <h3 className="hbp-title mt-1">{s.title}</h3>
              <p className="hb-sub mt-1 text-body-l max-w-[46ch]">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ProcessBlackSteps;
