"use client";
// Client component: the site's load screen (owner's call, 2026-09-15). On a
// full page load the ground, the hex mark and a hairline of progress cover
// the page until the hero says it is whole; then the screen fades and the
// hero's own reveal plays, so nothing is seen half-built. What it waits on
// was the 3D glass logo until 2026-10-29 and is the hero's case card now;
// either way it is whatever carries [data-hero-wait]. Routes without one, and
// reduced motion, lift it at once. The (site) layout owns it, so client-side
// navigation never shows it again. A cap and an inline fallback in the layout
// make sure it can never stay up.

import { useEffect, useState } from "react";
import { HexMark } from "@/components/site/hex-mark";
import { onHeroState } from "@/lib/hero-state";

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
    const host = document.querySelector("[data-hero-wait]");
    if (!host || reduced) { lift(); return () => timers.forEach((t) => window.clearTimeout(t)); }

    const off = onHeroState((s) => { if (s !== "pending") lift(); });
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
