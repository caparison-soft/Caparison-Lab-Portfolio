"use client";
// Client component: stars behind the whole black home page (owner,
// 2026-11-07: "stars across the site"). One fixed canvas under every section
// (z-index -1 inside main, which isolates), so cards and pictures sit above
// it. Fainter than the hero's own sky; each star twinkles on its own clock and
// the field drifts a little against the scroll for depth, wrapping round. The
// hero paints its own sky over this. Stops while the tab is hidden; reduced
// motion draws one still frame.

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; sp: number; ph: number; z: number; bright: boolean; leaf: boolean };

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const hex = (n: string, f: string) => (css.getPropertyValue(n).trim() || f).replace("#", "");
    const rgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
    const BONE = rgb(hex("--color-bone", "#ECEEE8")), LEAF = rgb(hex("--color-lime", "#CDFF9B"));
    let W = 0, H = 0, stars: Star[] = [], raf = 0, clock = 0, last = performance.now();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 5200);
      stars = Array.from({ length: n }, () => {
        const bright = Math.random() < 0.05;
        return {
          x: Math.random() * W, y: Math.random() * H,
          r: bright ? 0.9 + Math.random() * 0.7 : 0.3 + Math.random() * 0.6,
          a: bright ? 0.6 + Math.random() * 0.3 : 0.12 + Math.random() * 0.4,
          sp: 0.0006 + Math.random() * 0.002, ph: Math.random() * 6.3, z: 0.2 + Math.random() * 0.8,
          bright, leaf: Math.random() < 0.15,
        };
      });
    };

    const draw = (dt: number) => {
      clock += dt;
      ctx.clearRect(0, 0, W, H);
      const scroll = window.scrollY;
      for (const s of stars) {
        // Nearer stars move further with the scroll; all wrap round the screen.
        const y = (((s.y - scroll * 0.06 * s.z) % H) + H) % H;
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(clock * s.sp + s.ph);
        const a = s.a * tw;
        const col = s.leaf ? LEAF : BONE;
        ctx.fillStyle = `rgba(${col},${a})`;
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.bright) {
          const L = s.r * 4.5 * tw;
          ctx.strokeStyle = `rgba(${col},${a * 0.5})`; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(s.x - L, y); ctx.lineTo(s.x + L, y); ctx.moveTo(s.x, y - L); ctx.lineTo(s.x, y + L); ctx.stroke();
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      if (!document.hidden) draw(dt);
      raf = requestAnimationFrame(frame);
    };

    resize();
    const onResize = () => { resize(); if (reduced) draw(0); };
    window.addEventListener("resize", onResize);
    let onScroll: (() => void) | null = null;
    if (reduced) {
      draw(0);
      onScroll = () => draw(0);
      window.addEventListener("scroll", onScroll, { passive: true });
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (onScroll) window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="hb-stars" aria-hidden="true" />;
}
