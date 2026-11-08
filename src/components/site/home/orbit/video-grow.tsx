"use client";
// Client component: the mission row with the walkthrough video under it
// (owner, 2026-11-08: "a small thumbnail right after this section; it grows
// here, shrinks here, then the next section"). Both sit on one pinned screen:
// the mission row, and under it a small thumbnail with no label or arrow (so
// it does not read as a button). Scrolling grows the thumbnail into the full
// player in the middle of the screen while the row fades, holds, then shrinks
// it back into its place under the row, and the page moves on. The video
// plays by itself, muted, while it is large and is unloaded as it shrinks.
// YouTube and Vimeo play as muted embeds, anything else in a muted <video>;
// with no video set the thumbnail fills the frame with a short note.
// Reduced motion: no pin, the row and then the full-size frame, a play button.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HexMark } from "@/components/site/hex-mark";

type Props = { label: string; url: string; poster: string; soon: string; play: string; children: ReactNode };

const isLink = (v: string) => /^https?:\/\//.test(v);

/** A muted, autoplaying embed URL for YouTube and Vimeo links, or null. */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&rel=0` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      const h = u.searchParams.get("h");
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&playsinline=1&badge=0${h ? `&h=${h}` : ""}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function VideoGrow({ label, url, poster, soon, play, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const video = isLink(url) ? url : "";
  const embed = video ? embedUrl(video) : null;

  useEffect(() => {
    const el = ref.current, stage = stageRef.current, slot = slotRef.current, frame = frameRef.current;
    if (!el || !stage || !slot || !frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    let raf = 0;
    let on = false;
    // The stage is only as tall as the row and the thumbnail, so no empty
    // screen sits above or below them; it pins centred on the screen, and the
    // section is that height plus the scroll the growing takes.
    let top = 0, travel = 0;
    const size = () => {
      const vh = window.innerHeight, sh = stage.offsetHeight;
      top = Math.max(0, (vh - sh) / 2);
      travel = vh * 1.5;
      stage.style.top = `${top}px`;
      el.style.height = `${sh + travel}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    window.addEventListener("resize", size);
    const loop = () => {
      const r = el.getBoundingClientRect();
      const p = travel > 0 ? clamp((top - r.top) / travel) : 0;
      // Small, grow, hold, shrink, small.
      const g = p < 0.12 ? 0 : p < 0.42 ? ease((p - 0.12) / 0.3) : p < 0.62 ? 1 : p < 0.9 ? ease(1 - (p - 0.62) / 0.28) : 0;
      // The frame travels from the slot under the row to the middle of the stage.
      const st = stage.getBoundingClientRect(), sl = slot.getBoundingClientRect();
      const fromY = sl.top + sl.height / 2 - (st.top + st.height / 2);
      const min = sl.width / Math.max(1, frame.offsetWidth);
      const s = min + (1 - min) * g;
      el.style.setProperty("--g", g.toFixed(4));
      el.style.setProperty("--s", s.toFixed(4));
      el.style.setProperty("--y", `${(fromY * (1 - g)).toFixed(1)}px`);
      const next = on ? g > 0.45 : g > 0.9;
      if (next !== on) {
        on = next;
        setLive(next);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);

  const showPlayer = live && Boolean(video);

  return (
    <section ref={ref} className="vg-section" aria-label={label}>
      <div ref={stageRef} className="vg-stage">
        <div className="vg-intro">{children}</div>
        {/* The thumbnail's resting place under the row. */}
        <div ref={slotRef} className="vg-slot" aria-hidden="true" />
        <div ref={frameRef} className="vg-frame">
          {isLink(poster) ? (
            <img src={poster} alt="" className="vg-poster" />
          ) : (
            <span className="vg-poster vg-poster--blank"><HexMark variant="simple" maskId="hexmark-video-grow" className="vg-mark" /></span>
          )}
          {showPlayer && embed ? (
            <iframe src={embed} title={label} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          ) : showPlayer ? (
            <video src={video} autoPlay muted loop playsInline controls />
          ) : reduced && video ? (
            <button type="button" className="vg-play" aria-label={play} onClick={() => setLive(true)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L13 8 5 3.2Z" fill="currentColor" /></svg>
            </button>
          ) : null}
          {!video ? <p className="vg-soon">{soon}</p> : null}
        </div>
      </div>
    </section>
  );
}
