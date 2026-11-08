"use client";
// Client component: the site's cursor (owner, 2026-11-07: "like before", the
// prototype's). A Bright Leaf arrow with an Emerald edge, so it reads on black
// and on bone alike, trailing the pointer on a spring. Over anything clickable
// it grows and tips a little, project cards included (the "View" disc that
// used to replace it there was dropped by the owner, 2026-11-07); it hides
// over text fields. The dot-and-ring cursor it replaces was Emerald and black, and
// vanished on the black home page. Also drives the .cl-spot pointer light on
// cards. Fine pointers only, never under reduced motion.

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

type State = "default" | "link" | "text" | "hide";

const CLICKABLE = "a, button, [role='button'], summary, label, select, [data-cursor='link']";

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // The arrow trails the pointer a touch.
  const ax = useSpring(x, { stiffness: 900, damping: 50, mass: 0.4 });
  const ay = useSpring(y, { stiffness: 900, damping: 50, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const root = rootRef.current;
    let last: Element | null = null;

    const set = (k: string, v: string) => {
      if (root && root.dataset[k] !== v) root.dataset[k] = v;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      set("visible", "true");
      const target = e.target as Element | null;

      // Pointer light on cards.
      const spot = target?.closest<HTMLElement>(".cl-spot");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      if (target === last) return;
      last = target;
      let state: State = "default";
      const marked = target?.closest<HTMLElement>("[data-cursor]");
      if (marked?.dataset.cursor === "hide") state = "hide";
      else if (target?.closest("input, textarea, [contenteditable='true']")) state = "text";
      else if (target?.closest(CLICKABLE)) state = "link";
      set("state", state);
    };
    const onLeave = () => set("visible", "false");
    // A cross-origin player (Vimeo) shows the system cursor and sends us no
    // pointer events, so the arrow steps aside while the pointer is over one.
    const onOut = (e: PointerEvent) => {
      if ((e.relatedTarget as Element | null)?.tagName === "IFRAME") set("visible", "false");
    };

    // The arrow lives in the top layer as a manual popover. Modal dialogs open
    // in the top layer too, above whatever was there, so each time one opens
    // the arrow is shown again to sit above it (owner, 2026-11-07: the cursor
    // turned into the system one inside the video popups).
    const lift = () => {
      if (!root || typeof root.showPopover !== "function") return;
      try {
        if (root.matches(":popover-open")) root.hidePopover();
        root.showPopover();
      } catch {
        /* popover unsupported or the node is detached; the plain layer still works */
      }
    };
    lift();
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.target instanceof HTMLDialogElement && r.target.open)) lift();
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    const onDown = () => set("pressed", "true");
    const onUp = () => set("pressed", "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerout", onOut);
    return () => {
      mo.disconnect();
      document.removeEventListener("pointerout", onOut);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  return (
    <div ref={rootRef} className="cl-cursor" popover="manual" aria-hidden="true" data-state="default" data-visible="false">
      <motion.div className="cl-cursor-arrow" style={{ x: ax, y: ay }}>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M3 2.5 20.5 10l-7.2 2.3L10.9 20 3 2.5Z" fill="var(--color-lime)" stroke="var(--color-olive-950)" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </div>
  );
}
