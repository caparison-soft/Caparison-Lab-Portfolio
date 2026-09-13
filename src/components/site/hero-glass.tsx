"use client";
// Client component: the 3D glass logo over the headline, with real refraction.
// three.js can only refract what it draws, so the headline and sub are painted
// into the backdrop plane at their exact DOM positions and the DOM copies turn
// transparent while the glass is on. Phones, reduced motion and no-WebGL keep
// the still in the corner.

import { useEffect, useRef, useState } from "react";
import type { CaparisonLogoHandle } from "@/lib/vendor/caparison-logo";
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

export function HeroGlass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [useGl, setUseGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setUseGl(canRunWebGL()); }, []);

  useEffect(() => {
    if (!useGl || !canvasRef.current || !hostRef.current) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const block = host.parentElement as HTMLElement;
    let handle: CaparisonLogoHandle | null = null;
    let cancelled = false;
    const timers: number[] = [];

    const draw = (ctx: CanvasRenderingContext2D, w: number) => {
      const hostRect = host.getBoundingClientRect();
      const k = w / hostRect.width;
      ctx.scale(k, k);
      ctx.textBaseline = "alphabetic";
      for (const line of collectLines(block, hostRect)) {
        ctx.font = line.font;
        ctx.fillStyle = line.color;
        // "normal" is not a valid canvas value and would leave the previous spacing in place.
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = /px$/.test(line.letterSpacing) ? line.letterSpacing : "0px";
        ctx.fillText(line.text, line.x, line.baseline);
      }
    };

    const onReady = () => {
      setReady(true);
      block.setAttribute("data-glass-ready", "true");
    };
    canvas.addEventListener("logo:ready", onReady);

    const start = async () => {
      if (cancelled) return;
      await document.fonts.ready;
      const { mountCaparisonLogo } = await import("@/lib/vendor/caparison-logo");
      if (cancelled) return;
      const rect = host.getBoundingClientRect();
      // The plane takes the section's own background so the frame is invisible on any ground.
      const ground = getComputedStyle(host.closest("section") ?? document.body).backgroundColor;
      const texW = Math.min(4096, Math.round(rect.width * 2));
      const texH = Math.round(texW * (rect.height / rect.width));
      handle = mountCaparisonLogo(canvas, {
        src: GLB, transparent: true, autoRotate: true, drag: false, pointerParallax: true, scrollTilt: true, fit: 1.9, offset: [0.55, 0], depthScale: 0.65, swing: 0.55, envPreset: "wide",
        // The package material, slightly thinner so the text bends less.
        glass: { thickness: 0.3, ior: 1.6, dispersion: 6, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, transmission: 1, envMapIntensity: 2.2, specularIntensity: 1 },
        backdrop: { color: ground, size: [texW, texH], draw, z: -0.8 },
      });
    };
    const afterLoad = () => {
      timers.push(window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => { start().catch(() => setUseGl(false)); }, { timeout: 4000 });
        else start().catch(() => setUseGl(false));
      }, 3000));
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    // Text reflows on resize: repaint the backdrop to match.
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { handle?.repaintBackdrop(); }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(resizeTimer);
      window.removeEventListener("load", afterLoad);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("logo:ready", onReady);
      block.removeAttribute("data-glass-ready");
      handle?.dispose();
    };
  }, [useGl]);

  return (
    <>
      {/* Over the headline block, extended upwards into the hero's top padding so the logo has room. */}
      <div ref={hostRef} aria-hidden="true" className={cx("pointer-events-none absolute inset-x-0 -top-[88px] -bottom-[24px] z-10", useGl ? "block" : "hidden")}>
        {useGl ? <canvas ref={canvasRef} className={cx("absolute inset-0 w-full h-full transition-opacity dur-base", ready ? "opacity-100" : "opacity-0")} /> : null}
      </div>
    </>
  );
}

/** The still, in the top-right corner: phones always, desktops only when WebGL is not used. */
export function HeroStill({ desktopFallback }: { desktopFallback: boolean }) {
  return (
    <div aria-hidden="true" className={cx("reveal-mark absolute top-0 right-[-72px] w-[200px] md:w-[240px] md:right-[-96px] lg:w-[260px] lg:right-[-160px]", desktopFallback ? "block" : "lg:hidden")}>
      <img src="/brand/logo-3d-1280.webp" srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w" sizes="(min-width: 1024px) 260px, 240px" alt="" width={1280} height={1302} fetchPriority="high" decoding="async" className="w-full h-auto" />
    </div>
  );
}
