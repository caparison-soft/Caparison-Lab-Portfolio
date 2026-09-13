"use client";
// Client component: the hero ground. Owns the weave canvas and its clock.
// Fades in after the first frame, pauses off-screen, eases the pointer.
// Reduced motion renders one still frame with no pointer. No WebGL2 means
// no threads: the hero stays plain ink with grain.

import { useEffect, useRef } from "react";
import { createWeave } from "@/lib/hero-weave";

export function HeroWeave() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let weave: ReturnType<typeof createWeave> = null;
    try { weave = createWeave(canvas, { threads: window.innerWidth < 1024 ? 30 : 44, maxDpr: 2 }); } catch { weave = null; }
    if (!weave) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true, raf = 0, intensity = 0;
    let pointer: { x: number; y: number } | null = null;
    const t0 = performance.now();

    const scroll = () => { const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); return Math.min(1, window.scrollY / max); };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      intensity += (1 - intensity) * 0.06;
      weave!.render((performance.now() - t0) / 1000, pointer, scroll(), intensity);
    };
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onLeave = () => { pointer = null; };
    const onResize = () => { weave!.resize(); if (reduced) weave!.render(0, null, 0, 1); };

    weave.resize();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    window.addEventListener("resize", onResize);
    if (reduced) {
      weave.render(0, null, 0, 1);
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      frame();
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      weave?.dispose();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}
