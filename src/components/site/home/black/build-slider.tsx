"use client";
// Client component: "What we build" (owner, 2026-11-07: the live site's
// capability slider, with the six services and a moving picture in place of
// the still). Titles on the left; hovering, focusing or tapping one fans its
// letters up and swaps the picture on the right with a top-down clip reveal,
// with the service's line, price and timeline under it. The motion is CSS
// (src/styles/home-services.css), so server and client render the same markup
// and reduced motion simply turns it off. A GIF or video the owner sets for a
// service replaces its drawn demo; videos play muted on a loop and are only
// loaded once their service has been shown.

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { HbLink } from "./hb-link";

export type BuildItem = {
  id: string;
  name: string;
  href: string;
  blurb: string;
  price: string;
  timeline: string;
  /** A GIF, image or video link from the owner, or "". */
  media: string;
  /** The drawn demo, rendered on the server. */
  demo: ReactNode;
};

/** Letters fan up one by one; each word stays an unbreakable run. */
function Letters({ text }: { text: string }) {
  let n = 0;
  return (
    <span className="bs-letters" aria-hidden="true">
      {text.split(" ").map((word, w) => (
        <span key={w} className="bs-word">
          {word.split("").map((ch) => {
            const i = n++;
            return (
              <span key={i} className="bs-l" style={{ ["--i" as string]: i }}>
                <span>{ch}</span>
                <span>{ch}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

const isLink = (v: string) => /^https?:\/\//.test(v);
const isVideo = (v: string) => /\.(mp4|webm)(\?|#|$)/i.test(v);

export function BuildSlider({ items, seeHow }: { items: BuildItem[]; seeHow: string }) {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const pick = (i: number) => {
    setActive(i);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };
  const cur = items[active];

  return (
    <div className="bs-grid">
      <ul className="bs-list">
        {items.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="bs-title"
              aria-pressed={i === active}
              aria-controls="bs-panel"
              onMouseEnter={() => pick(i)}
              onFocus={() => pick(i)}
              onClick={() => pick(i)}
            >
              <span className="sr-only">{s.name}</span>
              <Letters text={s.name} />
            </button>
          </li>
        ))}
      </ul>

      <div id="bs-panel" className="bs-side">
        <div className="bs-media">
          {items.map((s, i) => (
            <div key={s.id} className={cx("bs-pane", i === active && "is-on")} aria-hidden={i !== active}>
              {isLink(s.media) && seen.has(i) ? (
                isVideo(s.media) ? (
                  <video src={s.media} autoPlay muted loop playsInline />
                ) : (
                  <img src={s.media} alt="" loading="lazy" />
                )
              ) : (
                s.demo
              )}
            </div>
          ))}
        </div>
        {cur ? (
          <div className="bs-info" aria-live="polite">
            <p className="bs-blurb">{cur.blurb}</p>
            <p className="bs-data"><span>{cur.price}</span><span>{cur.timeline}</span></p>
            <HbLink href={cur.href} className="mt-2">{seeHow}</HbLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}
