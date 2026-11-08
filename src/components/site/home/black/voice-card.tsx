"use client";
// Client component: one video testimonial. The Vimeo player is only loaded
// when the visitor presses play, so the section costs five thumbnails, not
// five players. The quote and name are server-rendered text either way.

import { useState } from "react";
import { cx } from "@/lib/cx";

export type Voice = { name: string; role: string; video: string; poster: string; quote: string; playLabel: string };

/** The player link with autoplay added, kept to player.vimeo.com links only. */
function playerSrc(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.hostname !== "player.vimeo.com") return null;
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return null;
  }
}

export function VoiceCard({ v, wide = false }: { v: Voice; wide?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const src = playerSrc(v.video);
  return (
    <figure className={cx("vo-card", wide && "vo-card--wide")}>
      <div className="vo-media">
        {playing && src ? (
          <iframe src={src} title={v.name} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          <button type="button" className="vo-play" onClick={() => setPlaying(true)} aria-label={v.playLabel} disabled={!src}>
            {v.poster ? <img src={v.poster} alt="" loading="lazy" /> : null}
            <span className="vo-play-btn" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M5 3.2v9.6L13 8 5 3.2Z" fill="currentColor" /></svg>
            </span>
          </button>
        )}
      </div>
      <div className="vo-body">
        <blockquote className="vo-quote"><p>{v.quote}</p></blockquote>
        <figcaption className="vo-who">
          <b>{v.name}</b>
          <span>{v.role}</span>
        </figcaption>
      </div>
    </figure>
  );
}
