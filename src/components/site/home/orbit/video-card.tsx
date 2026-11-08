"use client";
// Client component: the small video card between the mission row and the
// statement (owner, 2026-11-07, after a reference with a thumbnail, a dot, a
// label and an arrow pointing back at the picture). It sits in a zero-height
// slot and is placed in the exact middle of the empty space between the end of
// the mission row and the first line of the statement, so it has breathing
// room above and below (owner: small, centred, in the middle of the gap). Clicking it opens the video in a native
// <dialog>: the top layer clears the header and the grain, Escape and focus
// trapping come free, and the page behind stops scrolling. YouTube and Vimeo
// links play in an iframe, anything else in a <video>; the player is only
// mounted while the dialog is open, so closing it stops the sound. With no
// video yet the dialog says it is on its way. The thumbnail is the owner's
// poster image, or the brand mark on Emerald until there is one.

import { useEffect, useRef, useState } from "react";
import { HexMark } from "@/components/site/hex-mark";

type Props = { label: string; url: string; poster: string; soon: string; close: string };

/** An embeddable player URL for YouTube and Vimeo links, or null. */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

const isLink = (v: string) => /^https?:\/\//.test(v);

export function VideoCard({ label, url, poster, soon, close }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // The gap runs from the mission row's content (its section minus its bottom
  // padding) to the statement's first line (its offset inside the pinned box,
  // which starts where this slot is). The card's centre goes halfway.
  useEffect(() => {
    const slot = slotRef.current, card = cardRef.current;
    if (!slot || !card) return;
    const place = () => {
      const prev = slot.previousElementSibling as HTMLElement | null;
      const text = slot.nextElementSibling?.querySelector<HTMLElement>(".st-text");
      if (!prev || !text) return;
      const above = parseFloat(getComputedStyle(prev).paddingBottom) || 0;
      const below = text.offsetTop;
      card.style.top = `${(below - above) / 2 - card.offsetHeight / 2}px`;
    };
    place();
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  const video = isLink(url) ? url : "";
  const embed = video ? embedUrl(video) : null;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
      window.__lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else if (d.open) d.close();
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div ref={slotRef} className="vc-slot">
      <button ref={cardRef} type="button" className="vc-card" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span className="vc-thumb" aria-hidden="true">
          {isLink(poster) ? <img src={poster} alt="" loading="lazy" /> : <HexMark variant="simple" maskId="hexmark-video" className="vc-thumb-mark" />}
          <span className="vc-play">
            <svg viewBox="0 0 16 16"><path d="M5 3.2v9.6L13 8 5 3.2Z" fill="currentColor" /></svg>
          </span>
        </span>
        <span className="vc-label">
          <span className="vc-dot" aria-hidden="true" />
          {label}
        </span>
        <svg className="vc-arrow" viewBox="0 0 40 24" aria-hidden="true">
          <path d="M38 12H3M12 3 3 12l9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        className="vc-dialog"
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        {/* First, so it takes focus on open rather than the player (which would swallow Escape). */}
        <button type="button" className="vc-close" aria-label={close} autoFocus onClick={() => setOpen(false)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <div className="vc-frame">
          {open && embed ? (
            <iframe src={embed} title={label} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
          ) : open && video ? (
            <video src={video} controls autoPlay playsInline poster={isLink(poster) ? poster : undefined} />
          ) : open ? (
            <div className="vc-soon">
              <HexMark variant="simple" maskId="hexmark-video-soon" className="vc-soon-mark" />
              <p>{soon}</p>
            </div>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
