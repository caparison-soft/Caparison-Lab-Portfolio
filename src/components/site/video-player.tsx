"use client";
// Client component: the case-page video player (owner-supplied design,
// 2026-09-14, rebuilt on our tokens). Controls float in a blurred pill over
// the video and appear on hover, focus or touch; seek and volume sliders,
// play/pause, mute, speed. Keyboard: space/k play, arrows seek and volume,
// m mute, f fullscreen. Poster shows until play. Reduced motion drops the
// slide-in. The native controls stay as the fallback before hydration.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";

type Props = { src: string; poster?: string; label?: string; width?: number; height?: number };

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

function Slider({ value, onChange, label, className }: { value: number; onChange: (v: number) => void; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    onChange(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cx("relative h-[4px] rounded-full bg-bone/25 cursor-pointer touch-none py-2 -my-2 bg-clip-content", className)}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); set(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons & 1) set(e.clientX); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(100, value + 5)); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(0, value - 5)); }
      }}
    >
      <span className="absolute left-0 top-2 h-[4px] rounded-full bg-bone" style={{ width: `${value}%` }} />
    </div>
  );
}

const Icon = {
  play: <path d="M6 4l12 8-12 8z" fill="currentColor" />,
  pause: <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />,
  volume: <><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></>,
  low: <><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></>,
  muted: <><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></>,
  full: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
};

export function VideoPlayer({ src, poster, label, width, height }: Props) {
  const v = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const hide = useRef(0);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setReady(true);
    const el = v.current;
    if (el && Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
  }, []);

  const reveal = useCallback(() => {
    setShow(true);
    window.clearTimeout(hide.current);
    hide.current = window.setTimeout(() => { if (v.current && !v.current.paused) setShow(false); }, 2500);
  }, []);
  useEffect(() => () => window.clearTimeout(hide.current), []);

  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) void el.play(); else el.pause(); reveal(); };
  const seek = (pct: number) => { const el = v.current; if (!el || !Number.isFinite(el.duration)) return; el.currentTime = (pct / 100) * el.duration; setProgress(pct); };
  const setVol = (pct: number) => { const el = v.current; if (!el) return; el.volume = pct / 100; el.muted = pct === 0; setVolume(pct / 100); setMuted(pct === 0); };
  const toggleMute = () => { const el = v.current; if (!el) return; el.muted = !el.muted; setMuted(el.muted); if (!el.muted && el.volume === 0) { el.volume = 1; setVolume(1); } };
  const setSpeed = (s: number) => { if (v.current) v.current.playbackRate = s; setSpeedState(s); };
  const fullscreen = () => { const el = root.current; if (!el) return; if (document.fullscreenElement) void document.exitFullscreen(); else void el.requestFullscreen?.(); };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).getAttribute("role") === "slider") return;
    const el = v.current; if (!el) return;
    switch (e.key) {
      case " ": case "k": e.preventDefault(); toggle(); break;
      case "ArrowRight": e.preventDefault(); el.currentTime = Math.min(el.duration || 0, el.currentTime + 5); reveal(); break;
      case "ArrowLeft": e.preventDefault(); el.currentTime = Math.max(0, el.currentTime - 5); reveal(); break;
      case "ArrowUp": e.preventDefault(); setVol(Math.min(100, volume * 100 + 10)); reveal(); break;
      case "ArrowDown": e.preventDefault(); setVol(Math.max(0, volume * 100 - 10)); reveal(); break;
      case "m": toggleMute(); reveal(); break;
      case "f": fullscreen(); break;
    }
  };

  const btn = "inline-flex items-center justify-center h-[36px] w-[36px] rounded-sm text-bone hover:bg-bone/15 focus-visible:bg-bone/15 transition-colors dur-fast";
  const pill = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 28 };

  return (
    <div
      ref={root}
      className="group relative w-full h-full bg-ink outline-none"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={reveal}
      onMouseMove={reveal}
      onMouseLeave={() => { if (v.current && !v.current.paused) setShow(false); }}
      onFocus={reveal}
      aria-label={label}
    >
      <video
        ref={v}
        src={src}
        poster={poster}
        width={width}
        height={height}
        playsInline
        preload="metadata"
        controls={!ready}
        className="absolute inset-0 w-full h-full object-cover"
        onClick={toggle}
        onPlay={() => { setPlaying(true); reveal(); }}
        onPause={() => { setPlaying(false); setShow(true); }}
        onEnded={() => { setPlaying(false); setShow(true); }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => { const el = e.currentTarget; setTime(el.currentTime); if (Number.isFinite(el.duration) && el.duration > 0) { setDuration(el.duration); setProgress((el.currentTime / el.duration) * 100); } }}
      />

      {/* Big play mark while paused, before the first play. */}
      {ready && !playing && time === 0 ? (
        <button type="button" onClick={toggle} aria-label="Play" className="absolute inset-0 m-auto h-[64px] w-[64px] rounded-full bg-ink/60 backdrop-blur-sm text-bone flex items-center justify-center hover:bg-ink/75 transition-colors dur-fast">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">{Icon.play}</svg>
        </button>
      ) : null}

      <AnimatePresence>
        {ready && (show || !playing) && time > 0 ? (
          <motion.div
            key="controls"
            initial={reduced ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(8px)" }}
            transition={pill}
            className="absolute inset-x-2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[min(640px,calc(100%-32px))] bottom-2 rounded-lg bg-ink/70 backdrop-blur-md border border-bone/10 p-2 text-bone on-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="data text-small tabular-nums text-bone">{fmt(time)}</span>
              <Slider value={progress} onChange={seek} label="Seek" className="flex-1" />
              <span className="data text-small tabular-nums text-sage">{fmt(duration)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className={btn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">{playing ? Icon.pause : Icon.play}</svg>
                </button>
                <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={btn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">{muted || volume === 0 ? Icon.muted : volume > 0.5 ? Icon.volume : Icon.low}</svg>
                </button>
                <Slider value={muted ? 0 : volume * 100} onChange={setVol} label="Volume" className="w-[72px] hidden sm:block" />
              </div>
              <div className="flex items-center gap-[2px]">
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button key={s} type="button" onClick={() => setSpeed(s)} aria-pressed={speed === s} className={cx("data text-small h-[32px] px-1 rounded-sm transition-colors dur-fast", speed === s ? "bg-bone text-ink" : "text-sage hover:text-bone hover:bg-bone/15")}>
                    {s}x
                  </button>
                ))}
                <button type="button" onClick={fullscreen} aria-label="Fullscreen" className={cx(btn, "ml-1")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">{Icon.full}</svg>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
