"use client";
// Client component: an endless horizontal marquee (owner-supplied
// ibelick/infinite-slider, 2026-09-14, rebuilt on motion without
// react-use-measure). Children render twice and the track is offset by a
// wrapped position, so the loop has no seam and no restart. Hovering eases to
// the slower speed, and the strip can be dragged (owner, 2026-09-17): the drag
// moves the same position the loop does, so letting go carries straight on.
// Reduced motion keeps the same markup, never starts the loop and never drags.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform, wrap } from "motion/react";
import { cx } from "@/lib/cx";

type Props = { children: ReactNode; gap?: number; duration?: number; durationOnHover?: number; reverse?: boolean; className?: string };

export function InfiniteSlider({ children, gap = 16, duration = 25, durationOnHover, reverse = false, className }: Props) {
  const reduced = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  // One loop is half the doubled track plus the gap that sits across the seam.
  const [span, setSpan] = useState(0);
  const position = useMotionValue(0);
  const x = useTransform(position, (v) => (span > 0 ? wrap(-span, 0, v) : 0));

  // Pixels per second, eased toward the target so hover does not snap.
  const speed = useRef(0);
  const dragging = useRef(false);
  const lastPointer = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSpan((e.contentRect.width + gap) / 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap]);

  useAnimationFrame((_, delta) => {
    if (reduced || span === 0) return;
    const seconds = Math.min(delta, 64) / 1000;
    const target = dragging.current ? 0 : span / (hovered && durationOnHover ? durationOnHover : duration);
    speed.current += (target - speed.current) * Math.min(1, seconds * 4);
    if (dragging.current) return;
    position.set(position.get() + (reverse ? 1 : -1) * speed.current * seconds);
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || span === 0) return;
    dragging.current = true;
    setGrabbing(true);
    lastPointer.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    position.set(position.get() + (e.clientX - lastPointer.current));
    lastPointer.current = e.clientX;
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setGrabbing(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className={cx("overflow-hidden", !reduced && (grabbing ? "cursor-grabbing select-none" : "cursor-grab"), className)}
      // Vertical gestures still scroll the page; only sideways drags reach us.
      style={reduced ? undefined : { touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div ref={trackRef} className="flex w-max" style={{ x, gap }}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}
