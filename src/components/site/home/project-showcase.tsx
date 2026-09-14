"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { RevealRow } from "@/components/site/reveal-row";
import { cx } from "@/lib/cx";

/**
 * Home work rows (owner-supplied design, 2026-09-14), rebuilt on our
 * primitives: each row is a link whose title letters fan out on hover, the
 * thumbnail springs in and follows the pointer, and an arrow slides in from
 * the right. Data comes from the database (no placeholder images); the
 * arrow is inline SVG; rows are Next links; keyboard focus shows the same
 * state; reduced motion drops the letter stagger and the spring and just
 * shows the image. The first row keeps the site's one scroll reveal.
 */

export type ShowcaseProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  year: number | null;
  cover: { src: string; srcSet: string; blurDataUrl: string | null } | null;
};

const MotionLink = motion.create(Link);

function Arrow() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-[28px] h-[28px] md:w-[40px] md:h-[40px]">
      <path d="M8 20h24M22 10l10 10-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Row({ p, reduced }: { p: ShowcaseProject; reduced: boolean }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });
  const top = useTransform(sy, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(sx, [0.5, -0.5], ["60%", "40%"]);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 24 };

  return (
    <MotionLink
      href={`/work/${p.slug}`}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      className="group relative flex items-center justify-between gap-3 border-b border-olive-600 py-3 md:py-4 no-underline transition-colors dur-slow hover:border-bone focus-visible:border-bone"
    >
      <div className="min-w-0">
        <motion.span
          variants={{ initial: { x: 0 }, hover: { x: -12 } }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24, staggerChildren: 0.03, delayChildren: 0.1 }}
          className="relative z-10 block text-h2 md:text-display-l text-sage group-hover:text-bone group-focus-visible:text-bone transition-colors dur-slow"
        >
          {reduced
            ? p.title
            : p.title.split("").map((ch, i) => (
                <motion.span key={i} variants={{ initial: { x: 0 }, hover: { x: 12 } }} transition={spring} className={cx("inline-block", ch === " " && "w-[0.3em]")}>
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
        </motion.span>
        <span className="relative z-10 mt-1 block text-body text-ash group-hover:text-bone group-focus-visible:text-bone transition-colors dur-slow max-w-[60ch]">{p.summary}</span>
      </div>

      {p.cover ? (
        <motion.img
          style={{ top, left, translateX: "-10%", translateY: "-50%" }}
          variants={reduced ? { initial: { opacity: 0 }, hover: { opacity: 1 } } : { initial: { scale: 0, rotate: "-12.5deg" }, hover: { scale: 1, rotate: "12.5deg" } }}
          transition={spring}
          src={p.cover.src}
          srcSet={p.cover.srcSet}
          sizes="256px"
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute z-0 hidden [@media(hover:hover)]:block h-[96px] w-[160px] md:h-[180px] md:w-[288px] rounded-lg object-cover shadow-[0_24px_48px_rgb(0_0_0/0.45)]"
        />
      ) : null}

      <div className="overflow-hidden flex-none">
        <motion.div variants={{ initial: { x: "100%", opacity: 0 }, hover: { x: "0%", opacity: 1 } }} transition={spring} className="relative z-10 p-1 text-bone">
          <Arrow />
        </motion.div>
      </div>
    </MotionLink>
  );
}

export function ProjectShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <ol className="list-none m-0 p-0 border-t border-olive-600">
      {projects.map((p, i) =>
        i === 0 ? <RevealRow key={p.id}><Row p={p} reduced={reduced} /></RevealRow> : <li key={p.id}><Row p={p} reduced={reduced} /></li>,
      )}
    </ol>
  );
}
