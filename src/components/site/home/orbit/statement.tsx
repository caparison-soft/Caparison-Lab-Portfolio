"use client";
// Client component: the pinned statement (owner, 2026-11-07, from the
// reference video). One sentence about the whole service holds the screen
// while the visitor scrolls: its words light up in reading order, then a phone
// rises from below, tilted, and settles in the middle (a 3D flip like the
// reference was tried on 2026-11-07 and dropped by the owner), and its screen
// comes alive (owner, 2026-11-07): the phone buzzes with an incoming call from
// Caparison Lab, the call is accepted, and the app opens on the result: a
// booking lands, the day's count ticks up, the jobs drop in and the rating's
// stars fill one by one. It plays each time the phone arrives. The business
// and numbers are an example, and the section says so.
// Dim words stay at 3:1 or better (large text), never faded to nothing. The
// phone scales to the window height so the button under it never touches it.
// Reduced motion and no JS: no pinning, no flip; the sentence, the phone (on
// the app screen) and the button sit one after another, all lit (CSS).

import { useEffect, useRef } from "react";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { HexMark } from "@/components/site/hex-mark";

export type StatementPiece = { kind: "word"; text: string; accent: boolean } | { kind: "img"; src: string; srcSet: string };
export type StatementJob = { job: string; who: string; time: string };
export type StatementNote = { title: string; body: string };

type Props = {
  pieces: StatementPiece[];
  cta: { label: string; href: string };
  phone: {
    day: string;
    business: string;
    headline: string[];
    jobs: StatementJob[];
    caller: string;
    callLabel: string;
    decline: string;
    accept: string;
    booked: StatementNote;
    rating: StatementNote;
  };
  note: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

/** Splits the headline's first number out so it can tick up: "7 jobs booked," -> ["", 7, " jobs booked,"]. */
function splitCount(line: string): [string, number | null, string] {
  const m = line.match(/^(\D*)(\d+)(.*)$/);
  return m ? [m[1], Number(m[2]), m[3]] : [line, null, ""];
}

export function HomeStatement({ pieces, cta, phone, note }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [before, finalCount, after] = splitCount(phone.headline[0] ?? "");
  const startCount = finalCount === null ? null : Math.max(0, finalCount - 3);

  useEffect(() => {
    const section = sectionRef.current, text = textRef.current, ph = phoneRef.current, screen = screenRef.current, ctaEl = ctaRef.current;
    if (!section || !text || !ph || !screen || !ctaEl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = [...text.querySelectorAll<HTMLElement>(".st-wd")];
    if (reduced) {
      words.forEach((w) => w.classList.add("is-lit"));
      return;
    }
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const fit = () => {
      const max = window.matchMedia("(max-width: 860px)").matches ? 0.8 : 1;
      ph.style.scale = String(Math.max(0.55, Math.min(max, (window.innerHeight - 230) / 560)));
    };

    // The screen's story: start it when the phone has turned to face us, reset
    // it when the phone drops away again, so it plays on every arrival.
    let live = false, timers: number[] = [];
    const setCount = (n: number) => { if (countRef.current) countRef.current.textContent = String(n); };
    const goLive = (on: boolean) => {
      if (on === live) return;
      live = on;
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      screen.classList.toggle("is-live", on);
      if (finalCount === null || startCount === null) return;
      setCount(startCount);
      if (on) for (let n = startCount + 1, i = 0; n <= finalCount; n++, i++) timers.push(window.setTimeout(() => setCount(n), 3700 + i * 380));
    };

    let raf = 0, lastLit = -1;
    const frame = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (r.bottom > 0 && r.top < window.innerHeight && span > 0) {
        const p = clamp(-r.top / span);
        const lit = Math.round(clamp(p / 0.35) * words.length);
        if (lit !== lastLit) {
          words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
          lastLit = lit;
        }
        const k = ease(clamp((p - 0.3) / 0.45));
        ph.style.transform = `translateY(${(1 - k) * window.innerHeight * 0.95}px) rotate(${(1 - k) * 8}deg)`;
        goLive(p > 0.68);
        ctaEl.dataset.on = p > 0.8 ? "true" : "false";
      } else if (r.top >= window.innerHeight) goLive(false);
      raf = requestAnimationFrame(frame);
    };
    fit();
    setCount(startCount ?? 0);
    window.addEventListener("resize", fit);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", fit);
    };
  }, [finalCount, startCount]);

  return (
    <section ref={sectionRef} className="st-section">
      <div className="st-pin">
        <p ref={textRef} className="st-text">
          {pieces.map((p, i) =>
            p.kind === "img" ? (
              <span key={i} className="st-chip" aria-hidden="true">
                <img src={p.src} srcSet={p.srcSet || undefined} sizes="96px" alt="" loading="lazy" />
              </span>
            ) : (
              <span key={i}>
                <span className={p.accent ? "st-wd st-wd--lf" : "st-wd"}>{p.text}</span>{" "}
              </span>
            ),
          )}
        </p>

        <div ref={phoneRef} className="st-phone" aria-hidden="true">
          <div className="st-face st-face--front">
            <div ref={screenRef} className="st-screen">
              <div className="st-notch" />

              {/* The call: Caparison Lab rings, the phone buzzes, the call is taken. */}
              <div className="st-call">
                <p className="st-call-label">{phone.callLabel}</p>
                <p className="st-call-name">{phone.caller}</p>
                <span className="st-call-av">
                  <i /><i />
                  <HexMark variant="simple" maskId="hexmark-call" className="st-call-mark" />
                </span>
                <div className="st-call-actions">
                  <span className="st-call-btn">
                    <b className="st-call-decline"><svg viewBox="0 0 20 20"><path d="M3.2 11.6c4-3.6 9.6-3.6 13.6 0l-1.9 2.2-2.6-1.3v-2.2a9 9 0 0 0-4.6 0v2.2l-2.6 1.3Z" /></svg></b>
                    {phone.decline}
                  </span>
                  <span className="st-call-btn">
                    <b className="st-call-accept"><svg viewBox="0 0 20 20"><path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1c.5 6 5.4 10.9 11.4 11.4a1 1 0 0 0 1.1-1v-2l-3-1.2-1.6 1.6a8 8 0 0 1-4.3-4.3L8.7 7.5 7.5 4.5Z" /></svg></b>
                    {phone.accept}
                  </span>
                </div>
              </div>

              {/* The app: slides up once the call is taken, then fills. */}
              <div className="st-app">
                <div className="st-scr-head"><span>{phone.day}</span><span>{phone.business}</span></div>
                <p className="st-scr-big">
                  <span className="block">
                    {before}
                    {finalCount !== null ? <span ref={countRef}>{finalCount}</span> : null}
                    {after}
                  </span>
                  {phone.headline.slice(1).map((l, i) => (
                    <span key={i} className="block">{l}</span>
                  ))}
                </p>
                <div className="st-booked">
                  <span className="st-booked-ic"><svg viewBox="0 0 20 20"><path d="m5 10.5 3 3 7-7" /></svg></span>
                  <div><b>{phone.booked.title}</b><span>{phone.booked.body}</span></div>
                </div>
                {phone.jobs.map((j, i) => (
                  <div key={j.job} className="st-job" style={{ ["--n" as string]: i }}>
                    <span className="st-job-av">{initials(j.who)}</span>
                    <div><b>{j.job}</b>{j.who}</div>
                    <span className="st-job-t">{j.time}</span>
                  </div>
                ))}
                <div className="st-rating">
                  <b className="st-rating-score">{phone.rating.title}</b>
                  <div>
                    <span className="st-stars">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ ["--n" as string]: i }}>★</i>)}</span>
                    <span className="st-rating-note">{phone.rating.body}</span>
                  </div>
                </div>
                <div className="st-scr-bar">
                  <svg viewBox="0 0 20 20"><path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M8 17v-4h4v4" /></svg>
                  <svg viewBox="0 0 20 20"><rect x="3" y="4.5" width="14" height="12" rx="2" /><path d="M3 8.5h14M7 3v3M13 3v3" /></svg>
                  <svg viewBox="0 0 20 20"><path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1c.5 6 5.4 10.9 11.4 11.4a1 1 0 0 0 1.1-1v-2l-3-1.2-1.6 1.6a8 8 0 0 1-4.3-4.3L8.7 7.5 7.5 4.5Z" /></svg>
                  <svg viewBox="0 0 20 20"><path d="M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2L5.8 16l.8-4.7L3.2 8l4.7-.7L10 3Z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={ctaRef} className="st-cta" data-on="false">
          <ArrowFillButton label={cta.label} href={cta.href} size="sm" />
        </div>
        <p className="st-note">{note}</p>
      </div>
    </section>
  );
}
