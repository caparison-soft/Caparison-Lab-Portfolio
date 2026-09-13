"use client";
// Client component: the hero ground. Draws the shared line field on a 2D
// canvas, owns the clock and the pointer. Pauses off-screen; reduced motion
// and phones draw one still frame. Grain is CSS (.hero::after).

import { useEffect, useRef } from "react";
import { getLinesField } from "@/lib/hero-lines";

export function HeroLines() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const field = getLinesField();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 1023px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, visible = true, raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => { ctx.clearRect(0, 0, w, h); field.draw(ctx, w, h, small); };
    const frame = () => { raf = requestAnimationFrame(frame); if (!visible) return; field.tick(); draw(); };
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); field.setPointer(e.clientX - r.left, e.clientY - r.top); };
    const onLeave = () => field.clearPointer();
    const onResize = () => { resize(); if (reduced || small) draw(); };

    resize();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    window.addEventListener("resize", onResize);
    if (reduced || small) draw();
    else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      frame();
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}
