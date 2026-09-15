"use client";
// Client component: the site's load screen (owner's call, 2026-09-15). On a
// full page load the ground, the hex mark and a hairline of progress cover
// the page until the hero glass is drawing; then the screen fades and the
// hero's own reveal plays, so the page appears whole rather than the still
// swapping into the 3D logo in front of the visitor. Pages without a glass
// host, phones, reduced motion and no-WebGL lift it at once. The (site)
// layout owns it, so client-side navigation never shows it again. A cap and
// an inline fallback in the layout make sure it can never stay up.

import { useEffect, useState } from "react";
import { HexMark } from "@/components/site/hex-mark";
import { onGlassState } from "@/lib/glass-state";

/** Longest the screen may hold before the page is shown regardless. */
const CAP_MS = 6000;

export function Preloader() {
  const [phase, setPhase] = useState<"on" | "done" | "off" | "gone">("on");

  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];
    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      // Bar completes, then the screen fades as the hero reveal starts.
      setPhase("done");
      timers.push(window.setTimeout(() => {
        root.removeAttribute("data-preload");
        setPhase("off");
        timers.push(window.setTimeout(() => setPhase("gone"), 700));
      }, 220));
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = document.querySelector("[data-glass-host]");
    if (!host || reduced) { lift(); return () => timers.forEach((t) => window.clearTimeout(t)); }

    const off = onGlassState((s) => { if (s !== "pending") lift(); });
    timers.push(window.setTimeout(lift, CAP_MS));
    return () => { off(); timers.forEach((t) => window.clearTimeout(t)); };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className="preloader" data-phase={phase} aria-hidden="true">
      <HexMark className="preloader-mark" aperture="bone" />
      <span className="preloader-bar"><i /></span>
    </div>
  );
}
