"use client";
// Client component: the hero's ground. A grid of fine ink dots that swell and
// darken around the pointer, with a slow wave running through them and a few
// olive dots near the pointer. Canvas 2D, scaled for the screen's pixel ratio,
// drawn only while on screen. Reduced motion draws one still frame.

import { useEffect, useRef } from "react";

const GAP = 26;
const REACH = 170;

export function DotField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    // Pointer in canvas space, eased toward the real position.
    const target = { x: -9999, y: -9999 };
    const p = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      p.x += (target.x - p.x) * 0.12;
      p.y += (target.y - p.y) * 0.12;
      const time = t / 1000;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - p.x;
          const dy = y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const near = Math.max(0, 1 - d / REACH);
          const wave = reduced ? 0.5 : (Math.sin(x * 0.012 + y * 0.008 + time * 0.9) + 1) / 2;
          // Dots near the pointer lean away from it a little.
          const push = near * near * 6;
          const ox = d > 0 ? (dx / d) * push : 0;
          const oy = d > 0 ? (dy / d) * push : 0;
          const r = 0.8 + wave * 0.35 + near * 1.9;
          const a = 0.1 + wave * 0.06 + near * 0.45;
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
          // Olive-400 close in, ink elsewhere (token colours, as rgb).
          ctx.fillStyle = near > 0.55 && (Math.floor(x / GAP) + Math.floor(y / GAP)) % 3 === 0 ? `rgba(111, 156, 119, ${Math.min(1, a + 0.25)})` : `rgba(0, 0, 0, ${a})`;
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    };
    const onLeave = () => {
      target.x = -9999;
      target.y = -9999;
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    if (reduced) {
      draw(0);
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
