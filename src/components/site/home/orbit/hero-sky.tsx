"use client";
// Client component: the hero's night sky, on one canvas behind the orbit
// (owner, 2026-11-07, picked from four backgrounds, then asked for stars;
// the ovals that spread out from the headline were dropped the same day).
//  - Stars: small, most faint, a few bright ones with a cross glint, some
//    Bright Leaf. Each twinkles on its own clock, they shift a touch against
//    the pointer for depth, and they thin out behind the headline.
//  - A comet runs one lap of the ring every eight seconds or so; each service
//    it passes flashes (onPing).
// Reads the orbit's geometry through getState() every frame. Stops while the
// hero is off screen or the tab is hidden. Reduced motion draws one still frame.

import { useEffect, useRef, type RefObject } from "react";

export type SkyState = {
  /** Ring centre and radii, in hero coordinates. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Current orbit angle and the number of services on it. */
  base: number;
  n: number;
  ready: boolean;
};

type Props = {
  heroRef: RefObject<HTMLElement | null>;
  getState: () => SkyState;
  onPing: (i: number) => void;
};

const LEAF = "205,255,155";
const BONE = "236,238,232";

type Star = { x: number; y: number; r: number; a: number; sp: number; ph: number; z: number; bright: boolean; leaf: boolean };

export function HeroSky({ heroRef, getState, onPing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = heroRef.current, cv = canvasRef.current;
    if (!hero || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let W = 0, H = 0, raf = 0, visible = true, stars: Star[] = [];
    let px = 0, py = 0, inside = false, sox = 0, soy = 0, clock = 0;
    let cometT = -2500;
    const pinged = new Set<number>();

    const smooth = (e0: number, e1: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    };
    const onRing = (g: SkyState, a: number, k = 1): [number, number] => [g.cx + Math.cos(a) * g.rx * k, g.cy + Math.sin(a) * g.ry * k];
    const ringDist = (g: SkyState, x: number, y: number) => Math.hypot((x - g.cx) / g.rx, (y - g.cy) / g.ry);

    const resize = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 3600);
      stars = Array.from({ length: n }, () => {
        const bright = Math.random() < 0.07;
        return {
          x: Math.random() * W, y: Math.random() * H,
          r: bright ? 1 + Math.random() * 0.8 : 0.35 + Math.random() * 0.75,
          a: bright ? 0.75 + Math.random() * 0.25 : 0.2 + Math.random() * 0.55,
          sp: 0.0006 + Math.random() * 0.0022, ph: Math.random() * 6.3, z: 0.3 + Math.random() * 0.7,
          bright, leaf: Math.random() < 0.18,
        };
      });
      if (reduced) still();
    };

    const drawStars = (g: SkyState, dt: number) => {
      clock += dt;
      // Ease toward the pointer's offset; on leaving, ease back from wherever it was.
      const tx = inside ? (px - W / 2) * -0.012 : 0, ty = inside ? (py - H / 2) * -0.012 : 0;
      sox += (tx - sox) * 0.06; soy += (ty - soy) * 0.06;
      for (const s of stars) {
        const x = s.x + sox * s.z, y = s.y + soy * s.z;
        const tw = 0.55 + 0.45 * Math.sin(clock * s.sp + s.ph);
        const a = s.a * tw * (0.25 + 0.75 * smooth(0.35, 0.8, ringDist(g, x, y)));
        if (a < 0.02) continue;
        const col = s.leaf ? LEAF : BONE;
        ctx.fillStyle = `rgba(${col},${a})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.bright) {
          const L = s.r * 5 * tw;
          ctx.strokeStyle = `rgba(${col},${a * 0.55})`; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
          const gl = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
          gl.addColorStop(0, `rgba(${col},${a * 0.25})`); gl.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = gl; ctx.fillRect(x - s.r * 6, y - s.r * 6, s.r * 12, s.r * 12);
        }
      }
    };

    const drawComet = (g: SkyState, dt: number) => {
      cometT += dt;
      const LAP = 4200, REST = 3800;
      if (cometT > LAP + REST) { cometT = 0; pinged.clear(); }
      if (cometT < 0 || cometT > LAP) return;
      const k = cometT / LAP, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const head = g.base - Math.PI / 2 + e * Math.PI * 2;
      const life = Math.min(1, k * 8) * Math.min(1, (1 - k) * 8);
      const TAIL = 0.9, STEPS = 48;
      ctx.lineCap = "round";
      for (let i = 0; i < STEPS; i++) {
        const [x0, y0] = onRing(g, head - (i / STEPS) * TAIL), [x1, y1] = onRing(g, head - ((i + 1) / STEPS) * TAIL);
        const f = 1 - i / STEPS;
        ctx.strokeStyle = `rgba(${LEAF},${0.85 * f * f * life})`; ctx.lineWidth = 1 + 2.4 * f;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      const [hx, hy] = onRing(g, head);
      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 40);
      glow.addColorStop(0, `rgba(${LEAF},${0.55 * life})`); glow.addColorStop(1, `rgba(${LEAF},0)`);
      ctx.fillStyle = glow; ctx.fillRect(hx - 40, hy - 40, 80, 80);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * life})`;
      ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < g.n; i++) {
        const ai = g.base + (i * Math.PI * 2) / g.n;
        if (Math.abs(Math.atan2(Math.sin(head - ai), Math.cos(head - ai))) < 0.07 && !pinged.has(i)) {
          pinged.add(i);
          onPing(i);
        }
      }
    };

    function still() {
      const g = getState();
      if (!g.ready) return;
      ctx!.clearRect(0, 0, W, H);
      drawStars(g, 0);
    }

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const g = getState();
      if (g.ready && visible && !document.hidden) {
        ctx.clearRect(0, 0, W, H);
        drawStars(g, dt);
        drawComet(g, dt);
      }
      raf = requestAnimationFrame(frame);
    };

    // Tracked on the window, by position: anything floating over the hero (the
    // assistant button, a card) still counts as over it, and leaving keeps the
    // last position so nothing jumps (owner caught the stars jumping, 2026-11-07).
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) { px = e.clientX - r.left; py = e.clientY - r.top; }
    };
    const onLeaveWindow = () => { inside = false; };
    if (fine && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    resize();
    if (reduced) {
      // The orbit measures itself after fonts load; draw once it has.
      const t = window.setTimeout(still, 400);
      return () => { window.clearTimeout(t); io.disconnect(); ro.disconnect(); };
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [heroRef, getState, onPing]);

  return <canvas ref={canvasRef} className="ob-sky" aria-hidden="true" />;
}
