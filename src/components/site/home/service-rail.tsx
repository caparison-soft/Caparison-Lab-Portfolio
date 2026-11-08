"use client";
// Client component: the services band. On large screens it pins to the
// viewport and the four service cards slide sideways as the page scrolls
// (vertical scroll drives the horizontal track), with a progress bar under
// them. Smaller screens and reduced motion get a plain stack.

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import type { CapabilityItem } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { ServiceMotif } from "./service-motif";

type Labels = { kicker: string; heading: string; sub: string; from: string; all: string };

export function ServiceRail({ items, labels }: { items: CapabilityItem[]; labels: Labels }) {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const on = mq.matches && !reduced;
      setPinned(on);
      if (on && track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.0005 });
  const x = useTransform(smooth, (v) => -v * distance);

  return (
    <section
      ref={outer}
      id="services"
      className="section-dark on-dark relative"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 h-[100vh] overflow-hidden flex flex-col justify-center" : "py-6"}>
        <motion.div ref={track} className={pinned ? "rail-track" : "rail-stack"} style={pinned ? { x } : undefined}>
          <div className="rail-intro">
            <p className="cl-kicker">{labels.kicker}</p>
            <h2 className="text-display-l text-bone mt-2 max-w-[12ch]">{labels.heading}</h2>
            <p className="mt-3 text-body-l max-w-[40ch]">{labels.sub}</p>
            <Link href="/services" className="cl-link cl-link--always text-bone mt-4 inline-block">{labels.all}</Link>
          </div>
          {items.map((c) => {
            const img = c.image ? imageSrcSet(c.image.keyPrefix, c.image.variants) : null;
            return (
              <article key={c.slug} className="rail-card cl-spot" data-reveal={pinned ? undefined : "up"}>
                <div className="rail-art">
                  {img ? (
                    <img src={img.src} srcSet={img.srcSet} sizes="440px" alt={c.image?.alt ?? ""} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ServiceMotif slug={c.slug} className="w-[62%] h-auto text-olive-400" />
                  )}
                </div>
                <h3 className="text-h2 text-bone mt-3">
                  <Link href={`/services#${c.slug}`} className="no-underline text-bone hover:text-lime transition-colors dur-fast">{c.title}</Link>
                </h3>
                <p className="mt-1 text-body">{c.blurb}</p>
                <ul className="rail-list list-none p-0 m-0 mt-3">
                  {c.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 flex items-baseline justify-between gap-2 border-t border-olive-600">
                  {c.startingPrice ? <span className="data text-lime">{c.startingPrice.replace(/^from\s+/i, `${labels.from} `)}</span> : <span />}
                  {c.typicalTimeline ? <span className="data text-sage">{c.typicalTimeline}</span> : null}
                </div>
              </article>
            );
          })}
        </motion.div>
        {pinned ? (
          <div className="rail-progress" aria-hidden="true">
            <motion.span style={{ scaleX: smooth }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
