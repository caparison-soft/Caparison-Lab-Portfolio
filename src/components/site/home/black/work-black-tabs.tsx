"use client";
// Client component: the work section's filter (owner, 2026-11-07, after a
// reference with a row of category tabs over a framed grid of small cards).
// One tab for everything, then one per category; picking one shows only its
// items, and the cards fade up as they arrive. Items are projects (a link to
// the case page) or videos (owner, 2026-11-07): a video card opens the Vimeo
// player in a native <dialog> at the video's own shape, and the player is
// only mounted while the dialog is open, so closing it stops the sound.

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type WorkTab = { slug: string; label: string };
type Base = { slug: string; title: string; summary: string; category: string | null };
export type WorkItem =
  | (Base & { kind: "project"; cover: ReactNode })
  | (Base & { kind: "video"; video: string; poster: string; ratio: string; playLabel: string });

/** Small line icons for the tabs, by category; anything unknown gets the grid. */
function TabIcon({ slug }: { slug: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (slug) {
    case "saas-product":
      return <svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="9.5" rx="1.5" {...common} /><path d="M1.5 16.5h17" {...common} /></svg>;
    case "website-and-booking":
      return <svg viewBox="0 0 20 20"><rect x="2.5" y="3.5" width="15" height="13" rx="2" {...common} /><path d="M2.5 7.5h15M6 11h5M6 13.5h3" {...common} /></svg>;
    case "video-production":
      return <svg viewBox="0 0 20 20"><rect x="2.5" y="5" width="11" height="10" rx="2" {...common} /><path d="m13.5 9 4-2.5v7l-4-2.5" {...common} /></svg>;
    default:
      return <svg viewBox="0 0 20 20"><rect x="3" y="3" width="5.5" height="5.5" rx="1.2" {...common} /><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.2" {...common} /><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.2" {...common} /><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.2" {...common} /></svg>;
  }
}

/** A player.vimeo.com link with autoplay on, or null for anything else. */
function playerSrc(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.hostname !== "player.vimeo.com") return null;
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("badge", "0");
    return u.toString();
  } catch {
    return null;
  }
}

/** "9:16" to a CSS aspect-ratio and a width cap that keeps tall videos on screen. */
function shape(ratio: string) {
  const [w, h] = ratio.split(":").map(Number);
  const r = w > 0 && h > 0 ? w / h : 16 / 9;
  return { aspect: `${r}`, width: `min(1100px, calc(100vw - 32px), calc((100svh - 140px) * ${r}))` };
}

export function WorkBlackTabs({ tabs, items, closeLabel }: { tabs: WorkTab[]; items: WorkItem[]; closeLabel: string }) {
  const [active, setActive] = useState(tabs[0]?.slug ?? "all");
  const [playing, setPlaying] = useState<Extract<WorkItem, { kind: "video" }> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shown = active === "all" ? items : items.filter((p) => p.category === active);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (playing) {
      if (!d.open) d.showModal();
      window.__lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else if (d.open) d.close();
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [playing]);

  const src = playing ? playerSrc(playing.video) : null;
  const box = playing ? shape(playing.ratio) : null;

  return (
    <>
      <div className="hbw-tabs" role="group">
        {tabs.map((tab) => (
          <button key={tab.slug} type="button" className="hbw-tab" aria-pressed={tab.slug === active} aria-controls="hbw-panel" onClick={() => setActive(tab.slug)}>
            <span className="hbw-tab-ic" aria-hidden="true"><TabIcon slug={tab.slug} /></span>
            {tab.label}
          </button>
        ))}
      </div>

      <div id="hbw-panel" className="hbw-panel" aria-live="polite">
        <ul className="hbw-cards" key={active}>
          {shown.map((p, i) => (
            <li key={p.slug} className="hbw-item" style={{ ["--n" as string]: i }}>
              {p.kind === "project" ? (
                <Link href={`/work/${p.slug}`} className="hbw-card2">
                  <div className="hbw-thumb">{p.cover}</div>
                  <h3 className="hbw-name">{p.title}</h3>
                  <p className="hbw-line">{p.summary}</p>
                </Link>
              ) : (
                <button type="button" className="hbw-card2 hbw-card2--video" aria-haspopup="dialog" aria-label={p.playLabel} onClick={() => setPlaying(p)}>
                  <div className="hbw-thumb">
                    {p.poster ? <img src={p.poster} alt="" className="hbw-img" loading="lazy" /> : null}
                    <span className="hbw-play" aria-hidden="true">
                      <svg viewBox="0 0 16 16"><path d="M5 3.2v9.6L13 8 5 3.2Z" fill="currentColor" /></svg>
                    </span>
                  </div>
                  <span className="hbw-name">{p.title}</span>
                  <span className="hbw-line">{p.summary}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="hbw-dialog"
        aria-label={playing?.title}
        style={box ? { width: box.width } : undefined}
        onClose={() => setPlaying(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPlaying(null);
        }}
      >
        {/* First in the dialog, so it takes focus on open: focus inside the
            cross-origin player would swallow Escape. */}
        <button type="button" className="hbw-close" aria-label={closeLabel} autoFocus onClick={() => setPlaying(null)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <div className="hbw-frame" style={box ? { aspectRatio: box.aspect } : undefined}>
          {src ? <iframe src={src} title={playing?.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : null}
        </div>
      </dialog>
    </>
  );
}
