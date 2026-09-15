"use client";
// Client component: the 3D glass logo over the headline, with real refraction.
// three.js can only refract what it draws, so the headline and sub are painted
// into the backdrop plane at their exact DOM positions and the DOM copies turn
// transparent while the glass is on. Phones, reduced motion and no-WebGL keep
// the still in the corner.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CaparisonLogoHandle } from "@/lib/vendor/caparison-logo";
import { getSharedWeave } from "@/lib/hero-weave";
import { setGlassState } from "@/lib/glass-state";
import { cx } from "@/lib/cx";

const GLB = "/caparison_logo.glb";

function canRunWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

type Line = { text: string; x: number; baseline: number; font: string; letterSpacing: string; color: string };

/** Every line of text inside the block, with the position and style to redraw it. */
function collectLines(block: HTMLElement, origin: DOMRect): Line[] {
  const lines: Line[] = [];
  for (const el of Array.from(block.querySelectorAll<HTMLElement>("[data-glass-text]"))) {
    const cs = getComputedStyle(el);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) continue;
    const text = node.textContent ?? "";
    const range = document.createRange();
    // Walk characters to find line breaks, then measure each line's box.
    let start = 0;
    let lastTop: number | null = null;
    const push = (from: number, to: number) => {
      if (to <= from) return;
      range.setStart(node, from);
      range.setEnd(node, to);
      const r = range.getBoundingClientRect();
      const fontSize = parseFloat(cs.fontSize);
      const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
      // Baseline: centre the font's ascent+descent box inside the line box.
      const probe = document.createElement("canvas").getContext("2d");
      let asc = fontSize * 0.8;
      let desc = fontSize * 0.2;
      if (probe) {
        probe.font = font;
        const m = probe.measureText("Hg");
        if (m.fontBoundingBoxAscent) { asc = m.fontBoundingBoxAscent; desc = m.fontBoundingBoxDescent; }
      }
      const content = asc + desc;
      const baseline = r.top - origin.top + (lineHeight - content) / 2 + asc;
      lines.push({ text: text.slice(from, to).replace(/\s+$/, ""), x: r.left - origin.left, baseline, font, letterSpacing: cs.letterSpacing, color: cs.color });
    };
    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const top = range.getBoundingClientRect().top;
      if (lastTop !== null && Math.abs(top - lastTop) > 2) {
        push(start, i);
        start = i;
        // skip the leading space of a wrapped line
        if (text[start] === " ") start++;
      }
      lastTop = top;
    }
    push(start, text.length);
  }
  return lines;
}

type Live = {
  canvas: HTMLCanvasElement;
  handle: CaparisonLogoHandle;
  /** Host and block size the scene was fitted to; a different size means a fresh mount. */
  key: string;
  /** The current mount's backdrop painter (it closes over that mount's DOM). */
  draw: (ctx: CanvasRenderingContext2D, w: number) => void;
  ready: boolean;
};

/**
 * The mounted glass outlives the page: leaving the home page pauses it and
 * keeps the canvas, coming back (the wordmark, any link to /) reattaches it
 * before the first paint, so the still never shows again in a session
 * (owner, 2026-09-15). Module state; one WebGL context stays alive.
 */
let live: Live | null = null;

const geometryKey = (host: HTMLElement, block: HTMLElement) => {
  const h = host.getBoundingClientRect();
  const b = block.getBoundingClientRect();
  return `${Math.round(h.width)}x${Math.round(h.height)}:${Math.round(b.width)}`;
};

export function HeroGlass() {
  const hostRef = useRef<HTMLDivElement>(null);
  // Hydration (full load) starts from null/false like the server; a client-side
  // return to the page with a live glass starts ready so nothing else paints.
  const [useGl, setUseGl] = useState<boolean | null>(() => (live ? true : null));
  const [ready, setReady] = useState(() => Boolean(live?.ready));

  useEffect(() => { if (useGl === null) setUseGl(canRunWebGL()); }, [useGl]);
  // Tell the load screen whether to wait for the glass.
  useEffect(() => { if (useGl === false) setGlassState("off"); }, [useGl]);

  useLayoutEffect(() => {
    if (!useGl || !hostRef.current) return;
    const host = hostRef.current;
    const block = host.parentElement as HTMLElement;
    let cancelled = false;

    // Text lines are measured once (and on resize), not every frame: after the
    // glass is ready the DOM copy is transparent, so its colour must be cached.
    let cached: Line[] = [];
    const collect = () => {
      const next = collectLines(block, host.getBoundingClientRect());
      cached = next.map((l, i) => ({ ...l, color: /rgba\(\d+, \d+, \d+, 0\)/.test(l.color) && cached[i] ? cached[i].color : l.color }));
    };
    const draw = (ctx: CanvasRenderingContext2D, w: number) => {
      const hostRect = host.getBoundingClientRect();
      const k = w / hostRect.width;
      ctx.scale(k, k);
      // The weave canvas itself, offset to this region, so the threads continue
      // seamlessly through the glass and get refracted.
      const weave = getSharedWeave();
      if (weave) {
        const s = weave.canvas.getBoundingClientRect();
        ctx.drawImage(weave.canvas, s.left - hostRect.left, s.top - hostRect.top, s.width, s.height);
      }
      ctx.textBaseline = "alphabetic";
      for (const line of cached) {
        ctx.font = line.font;
        ctx.fillStyle = line.color;
        // "normal" is not a valid canvas value and would leave the previous spacing in place.
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = /px$/.test(line.letterSpacing) ? line.letterSpacing : "0px";
        ctx.fillText(line.text, line.x, line.baseline);
      }
    };

    const key = geometryKey(host, block);
    const reuse = live !== null && live.key === key;
    if (live && !reuse) { live.handle.dispose(); live = null; }
    const canvas = reuse && live ? live.canvas : document.createElement("canvas");
    canvas.className = cx("absolute inset-0 w-full h-full transition-opacity dur-slow", reuse && live?.ready ? "opacity-100" : "opacity-0");
    host.appendChild(canvas);

    const onReady = () => {
      if (live) live.ready = true;
      canvas.classList.replace("opacity-0", "opacity-100");
      setReady(true);
      block.setAttribute("data-glass-ready", "true");
      setGlassState("ready");
    };
    canvas.addEventListener("logo:ready", onReady);

    if (reuse && live) {
      live.draw = draw;
      collect();
      live.handle.resume();
      live.handle.repaintBackdrop();
      if (live.ready) onReady(); else setReady(false);
    } else {
      setReady(false);
    }

    const start = async () => {
      if (cancelled) return;
      await document.fonts.ready;
      collect();
      const { mountCaparisonLogo } = await import("@/lib/vendor/caparison-logo");
      if (cancelled) return;
      const rect = host.getBoundingClientRect();
      const texW = Math.min(4096, Math.round(rect.width * 2));
      const texH = Math.round(texW * (rect.height / rect.width));
      // Anchor the logo to the right edge of the block so it clears the headline:
      // the camera (fov 34 at z 4.1) shows 2.507 world units of height across the
      // host. The host runs 240px past the block so the near side of the swinging
      // logo is never cut by the canvas edge.
      const FIT = 1.9;
      const unitsPerPx = 2.507 / rect.height;
      const blockW = block.getBoundingClientRect().width;
      const centrePx = blockW - FIT / 2 / unitsPerPx - 8;
      const offsetX = Math.max(0.55, (centrePx - rect.width / 2) * unitsPerPx);
      const slot: Live = { canvas, key, draw, ready: false, handle: null as unknown as CaparisonLogoHandle };
      slot.handle = mountCaparisonLogo(canvas, {
        src: GLB, transparent: true, autoRotate: true, drag: false, pointerParallax: true, scrollTilt: true, fit: FIT, offset: [offsetX, 0], depthScale: 0.65, swing: 0.55, envPreset: "strips",
        // The environment's base is the matte ground tone (ink + lift + grain, measured
        // #1f1f1f), so the glass reflects the page instead of black between the strips.
        envBase: "#1f1f1f",
        // No filmic curve: ACES crushed the dark ground seen through the glass, so the
        // logo read as a shadow. 1:1 keeps the transmitted ground at the page tone.
        toneMapping: "none", exposure: 1,
        // The package material, slightly thinner so the text bends less.
        glass: { thickness: 0.12, ior: 1.5, dispersion: 6, roughness: 0, clearcoat: 0.6, clearcoatRoughness: 0, transmission: 1, envMapIntensity: 3.2, specularIntensity: 1 },
        // Opaque ground in the section colour, repainted every frame with the
        // live lines and the text, so the glass refracts what the page shows.
        // The painter goes through the slot so a later mount can swap in its own.
        backdrop: { color: getComputedStyle(host.closest("section") ?? document.body).backgroundColor, size: [texW, texH], draw: (ctx, w) => slot.draw(ctx, w), z: -0.8, live: true },
      });
      live = slot;
    };
    // Mount as soon as the page has loaded: the load screen covers the page
    // until the glass is drawing, so there is nothing to keep clean first.
    const afterLoad = () => { start().catch(() => { live = null; setUseGl(false); }); };
    if (!reuse) {
      if (document.readyState === "complete") afterLoad();
      else window.addEventListener("load", afterLoad, { once: true });
    }

    // Text reflows on resize: repaint the backdrop to match. The hero reveal
    // (rise) also moves the lines while it plays, so on a reattach the lines
    // measured before the first paint are re-measured when it ends.
    let resizeTimer = 0;
    const remeasure = (delay: number) => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { collect(); live?.handle.repaintBackdrop(); }, delay);
    };
    const onResize = () => remeasure(150);
    const onAnimationEnd = () => remeasure(50);
    window.addEventListener("resize", onResize);
    block.addEventListener("animationend", onAnimationEnd);
    if (reuse) remeasure(1000);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      window.removeEventListener("load", afterLoad);
      window.removeEventListener("resize", onResize);
      block.removeEventListener("animationend", onAnimationEnd);
      canvas.removeEventListener("logo:ready", onReady);
      block.removeAttribute("data-glass-ready");
      // Keep the scene for the next visit; just stop drawing while away.
      live?.handle.pause();
      canvas.remove();
    };
  }, [useGl]);

  return (
    <>
      {/* Over the headline block, extended upwards into the hero's top padding and 240px to the right so the logo has room. */}
      {/* The host is always in the DOM so the still (server-rendered) is on screen from
          the first paint, exactly where the glass will render; the canvas is appended
          by the effect (so it can outlive the page) and the still fades out when the
          glass is live. When WebGL is unavailable the still simply stays. */}
      <div ref={hostRef} aria-hidden="true" data-glass-host className="pointer-events-none absolute left-0 -right-[240px] -top-[88px] -bottom-[24px] z-10 hidden lg:block [container-type:size]">
        <img
          src="/brand/logo-3d-1280.webp"
          srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w"
          sizes="360px"
          alt=""
          width={1280}
          height={1302}
          fetchPriority="high"
          decoding="sync"
          // Same geometry as the glass mount: the logo spans FIT (1.9) of the 2.507 world
          // units the camera shows across the host height, so its width is 75.8% of the
          // host height and its right edge sits 8px inside the block's right edge (the
          // host runs 240px past it). Container units make that hold at any width.
          className={cx("absolute right-[248px] top-1/2 -translate-y-1/2 w-[75.8cqh] h-auto transition-opacity dur-slow", ready ? "opacity-0" : "opacity-100")}
        />
      </div>
    </>
  );
}

/** The still, in the top-right corner: phones always, desktops only when WebGL is not used. */
export function HeroStill({ desktopFallback }: { desktopFallback: boolean }) {
  return (
    <div aria-hidden="true" className={cx("reveal-mark absolute top-[56px] right-[-72px] w-[200px] md:w-[240px] md:right-[-96px] lg:top-0 lg:w-[260px] lg:right-[-160px]", desktopFallback ? "block" : "lg:hidden")}>
      <img src="/brand/logo-3d-1280.webp" srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w" sizes="(min-width: 1024px) 260px, 240px" alt="" width={1280} height={1302} fetchPriority="high" decoding="async" className="w-full h-auto" />
    </div>
  );
}
