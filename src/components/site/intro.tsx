"use client";
// Client component: the first-visit intro. An inline script in the (site)
// layout sets html[data-intro] before the first paint when this session has
// not seen it, which holds every reveal (src/styles/site.css). Here the mark
// and name play for about a second, the screen wipes up, and the page's own
// reveals run underneath. Later navigations and reduced motion skip it.

import { useEffect, useRef } from "react";
import { HexMark } from "@/components/site/hex-mark";

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute("data-intro")) return;
    try {
      sessionStorage.setItem("cl-intro", "1");
    } catch {
      // Private mode: the intro may play again, which is harmless.
    }
    const out = window.setTimeout(() => ref.current?.setAttribute("data-phase", "out"), 1150);
    const done = window.setTimeout(() => html.removeAttribute("data-intro"), 1500);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <div ref={ref} className="cl-intro" aria-hidden="true">
      <div className="flex flex-col items-center">
        <HexMark variant="simple" maskId="hexmark-intro" className="cl-intro-mark text-lime" />
        <div className="cl-intro-word">
          <img src="/brand/wordmark-bone.png" alt="" width={384} height={102} />
        </div>
        <div className="cl-intro-bar"><span /></div>
      </div>
    </div>
  );
}
