"use client";
// Client component: one IntersectionObserver for the whole site. Every element
// with data-reveal gets data-in="true" the first time it scrolls into view;
// the CSS in src/styles/site.css does the rest. New nodes (route changes,
// filtered lists) are picked up by a MutationObserver.

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    document.documentElement.setAttribute("data-reveal-ready", "");

    // What is observed -> what gets revealed. A clip reveal starts fully
    // clipped, and Chrome never reports a fully clipped target as
    // intersecting, so its parent is watched instead.
    const targets = new Map<Element, HTMLElement[]>();
    const watched = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const el of targets.get(e.target) ?? []) el.setAttribute("data-in", "true");
          targets.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    // React marks an element as hydrated by attaching its fiber. Changing an
    // attribute before that shows up as a hydration mismatch, so elements
    // still waiting for React (a late Suspense boundary) are retried shortly.
    const hydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    let retry = 0;
    let tries = 0;
    const scan = () => {
      let waiting = false;
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => {
        if (watched.has(el)) return;
        if (!hydrated(el) && tries < 60) {
          waiting = true;
          return;
        }
        watched.add(el);
        // Index children for stagger reveals so CSS can delay each one.
        if (el.dataset.reveal === "stagger") {
          Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
        }
        const target = el.dataset.reveal === "clip" && el.parentElement ? el.parentElement : el;
        const list = targets.get(target);
        if (list) list.push(el);
        else {
          targets.set(target, [el]);
          io.observe(target);
        }
      });
      window.clearTimeout(retry);
      if (waiting) {
        tries++;
        retry = window.setTimeout(scan, 150);
      }
    };
    // Start once the streamed page has loaded and React has had a frame to
    // hydrate it: touching attributes on a subtree React has not hydrated yet
    // shows up as a hydration mismatch.
    let raf = 0;
    let started = false;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    const start = () => {
      if (started) return;
      started = true;
      raf = requestAnimationFrame(scan);
      mo.observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(retry);
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
