"use client";
// Client component: the 3D glass logo needs WebGL and the DOM. The still is
// server-rendered and painted first; the canvas fades in once the mesh has
// loaded. Phones, reduced motion, and browsers without WebGL keep the still.

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

export function HeroMark3D({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [useGl, setUseGl] = useState(false);

  useEffect(() => {
    if (!canRunWebGL()) return;
    setUseGl(true);
  }, []);

  useEffect(() => {
    if (!useGl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let handle: CaparisonLogoHandle | null = null;
    let cancelled = false;
    const onReady = () => setReady(true);
    canvas.addEventListener("logo:ready", onReady);

    // Start well after load and only when the browser is idle: the shader
    // compile and mesh parse are a long task, and the still is already on
    // screen, so nothing is waiting on this.
    const start = () => {
      if (cancelled) return;
      import("@/lib/vendor/caparison-logo").then(({ mountCaparisonLogo }) => {
        if (cancelled) return;
        // The glass refracts only what three.js draws, so it gets a plane in
        // the page colour to look through. Nothing else sits behind the logo.
        // Material and light rig are the package defaults. The bone backdrop
        // plane and the olive-950 core give the glass something to refract on
        // a light page; without them it reads as pale plastic.
        handle = mountCaparisonLogo(canvas, {
          src: GLB, transparent: true, autoRotate: true, drag: true, pointerParallax: true, scrollTilt: true, fit: 1.75,
          backdrop: { color: "#ECEEE8" },
          darkCore: "#171B06",
          darkCoreScale: 0.92,
        });
      }).catch(() => setUseGl(false));
    };
    const afterLoad = () => {
      const timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => start(), { timeout: 4000 });
        else start();
      }, 3000);
      timers.push(timer);
    };
    const timers: number[] = [];
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", afterLoad);
      cancelled = true;
      canvas.removeEventListener("logo:ready", onReady);
      handle?.dispose();
    };
  }, [useGl]);

  return (
    <div className={cx("relative aspect-square", className)} aria-hidden="true">
      <img
        src="/brand/logo-3d-1280.webp"
        srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w"
        sizes="(min-width: 1280px) 560px, (min-width: 1024px) 260px, 240px"
        alt=""
        width={1280}
        height={1302}
        fetchPriority="high"
        decoding="async"
        className={cx("absolute inset-0 w-full h-full object-contain transition-opacity dur-base", ready && "opacity-0")}
      />
      {useGl ? (
        <canvas ref={canvasRef} className={cx("absolute inset-0 w-full h-full transition-opacity dur-base touch-none", ready ? "opacity-100" : "opacity-0")} />
      ) : null}
    </div>
  );
}
