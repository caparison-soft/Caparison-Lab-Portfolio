"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RevealRow } from "@/components/site/reveal-row";
import { cx } from "@/lib/cx";

/**
 * Hover showcase (owner-supplied design, 2026-09-13), rebuilt on our
 * primitives: a list of projects where hovering a row underlines the title,
 * slides in an arrow, and floats the cover beside the cursor. The floating
 * cover exists only on hover devices; keyboard focus gets the same row state
 * without it. A project without a cover shows no floating card. Reduced motion
 * snaps the cover instead of easing it.
 *
 * Differences from the pasted component: rows are Next links to the case
 * study, data comes from the database (no placeholder images), the arrow is
 * inline SVG, the cover is positioned inside the section (not fixed), and
 * the pointer easing runs on refs, not React state, so nothing re-renders
 * per frame.
 */

export type ShowcaseProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  year: number | null;
  cover: { src: string; srcSet: string; blurDataUrl: string | null } | null;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProjectShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  // Ease the cover toward the pointer. Runs only while a row is hovered.
  useEffect(() => {
    if (hovered === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const k = reduced ? 1 : 0.15;
      current.current.x += (target.current.x - current.current.x) * k;
      current.current.y += (target.current.y - current.current.y) * k;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${current.current.x + 24}px, ${current.current.y - 100}px, 0)`;
      }
      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf.current);
  }, [hovered]);

  const onMove = (e: React.MouseEvent) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // First hover: start where the pointer is instead of easing in from the corner.
    if (hovered === null) current.current = { ...target.current };
  };

  return (
    <div ref={rootRef} onMouseMove={onMove} className="relative">
      {/* The floating cover: hover devices only. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute left-0 top-0 z-30 hidden w-[280px] overflow-hidden rounded-lg transition-[opacity,scale] dur-base ease-out [@media(hover:hover)]:block",
          hovered === null || !projects[hovered]?.cover ? "opacity-0 scale-90" : "opacity-100 scale-100",
        )}
        style={{ boxShadow: "0 24px 48px rgb(0 0 0 / 0.45)" }}
      >
        <div className="relative h-[180px] w-full bg-olive-950">
          {projects.map((p, i) =>
            p.cover ? (
              <img
                key={p.id}
                src={p.cover.src}
                srcSet={p.cover.srcSet}
                sizes="280px"
                alt=""
                loading="lazy"
                decoding="async"
                className={cx("absolute inset-0 h-full w-full object-cover transition-[opacity,scale,filter] dur-slow ease-out", hovered === i ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-md")}
              />
            ) : null,
          )}
        </div>
      </div>

      <ol className="list-none m-0 p-0">
        {projects.map((p, i) => {
          const active = hovered === i;
          const inner = (
            <Link
              href={`/work/${p.slug}`}
              className="group relative block no-underline py-3"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Row highlight */}
              <span aria-hidden="true" className={cx("absolute inset-y-0 -inset-x-2 rounded-lg bg-olive-800/40 transition-[opacity,scale] dur-base ease-out group-focus-visible:opacity-100", active ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]")} />
              <span className="relative flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1">
                    <h3 className="text-h4 font-medium text-bone m-0">
                      <span className="relative">
                        {p.title}
                        <span aria-hidden="true" className={cx("absolute left-0 -bottom-[2px] h-px bg-bone transition-[width] dur-base ease-out group-focus-visible:w-full", active ? "w-full" : "w-0")} />
                      </span>
                    </h3>
                    <ArrowUpRight className={cx("text-sage transition-[opacity,transform] dur-base ease-out group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0", active ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-1 translate-y-1")} />
                  </span>
                  <span className={cx("mt-0.5 block text-small transition-colors dur-base ease-out", active ? "text-bone" : "text-sage")}>{p.summary}</span>
                </span>
                {p.year ? <span className={cx("data text-small tabular-nums transition-colors dur-base", active ? "text-bone" : "text-sage")}>{p.year}</span> : null}
              </span>
            </Link>
          );
          const cls = "border-t border-olive-600";
          return i === 0 ? <RevealRow key={p.id} className={cls}>{inner}</RevealRow> : <li key={p.id} className={cls}>{inner}</li>;
        })}
      </ol>
      <div className="border-t border-olive-600" />
    </div>
  );
}
