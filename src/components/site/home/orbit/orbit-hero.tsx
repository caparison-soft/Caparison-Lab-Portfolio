"use client";
// Client component: the home hero (owner, 2026-11-07). The headline sits in
// the middle; six services circle it on an oval, each a solid icon with its
// name under it. The oval is sized from the headline block so the icons never
// cross the text. One lap takes 80s; it slows while the pointer is over the
// hero and stops while a card is open. Hover or keyboard focus opens a card
// beside the icon; it takes the first spot that fits on screen (under or over
// the icon, else beside it) and never covers the icon (owner caught that).
// Under 860px the orbit becomes a circle under the headline, icons only, with
// the front service's name in the middle; a tap opens the card as a sheet.
// Reduced motion: the orbit stands still and the cards still open.

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { HexMark } from "@/components/site/hex-mark";
import { HeroSky, type SkyState } from "./hero-sky";
import { ServiceIcon, type ServiceId } from "./icons";

export type OrbitService = {
  id: ServiceId;
  name: string;
  pitch: string;
  items: string[];
  price: string;
  href: string;
  /** The card's picture, rendered on the server. */
  visual: ReactNode;
};

type Props = {
  services: OrbitService[];
  labels: { group: string; seeHow: string; close: string };
  /** The headline, sub and buttons, rendered on the server. */
  children: ReactNode;
};

const MOBILE = "(max-width: 860px)";
const LAP_MS = 80_000;
const CARD_W = 350;

export function OrbitHero({ services, labels, children }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [open, setOpen] = useState(-1);
  const [shown, setShown] = useState(0); // the card keeps its last content while it fades out
  const openRef = useRef(-1);
  const closeTimer = useRef(0);

  // Orbit state lives in refs: it changes every frame and nothing re-renders for it.
  const geo = useRef({ cx: 0, cy: 0, rx: 300, ry: 200, oy: 0, mobile: false, ready: false });
  const motion = useRef({ base: -Math.PI / 2, speed: 1, target: 1 });

  const n = services.length;

  const getState = useCallback(
    (): SkyState => ({ cx: geo.current.cx, cy: geo.current.cy + geo.current.oy, rx: geo.current.rx, ry: geo.current.ry, base: motion.current.base, n, ready: geo.current.ready }),
    [n],
  );
  const onPing = useCallback((i: number) => {
    const o = orbRefs.current[i];
    if (!o) return;
    o.classList.add("is-ping");
    window.setTimeout(() => o.classList.remove("is-ping"), 700);
  }, []);

  const measure = useCallback(() => {
    const hero = heroRef.current, core = coreRef.current, stage = stageRef.current, ring = ringRef.current;
    if (!hero || !core || !stage || !ring) return;
    const g = geo.current;
    g.mobile = window.matchMedia(MOBILE).matches;
    const h = hero.getBoundingClientRect();
    if (g.mobile) {
      const s = stage.getBoundingClientRect();
      g.cx = s.width / 2; g.cy = s.height / 2;
      g.rx = Math.min(150, s.width / 2 - 36); g.ry = Math.min(140, s.height / 2 - 40);
      g.oy = s.top - h.top;
    } else {
      const title = core.querySelector("h1")?.getBoundingClientRect() ?? core.getBoundingClientRect();
      const c = core.getBoundingClientRect();
      const top = title.top - h.top, bottom = c.bottom - 40 - h.top;
      g.cx = h.width / 2;
      g.cy = (top + bottom) / 2;
      g.rx = Math.min(title.width / 2 + 230, h.width / 2 - 130);
      g.ry = Math.min((bottom - top) / 2 + 100, g.cy - 70, h.height - g.cy - 40);
      g.oy = 0;
    }
    ring.style.width = `${g.rx * 2}px`;
    ring.style.height = `${g.ry * 2}px`;
    ring.style.transform = `translate(${g.cx - g.rx}px, ${g.cy - g.ry}px)`;
    g.ready = true;
    stage.dataset.ready = "";
  }, []);

  // Place every icon on the oval; the one nearest the viewer is larger and on top.
  const front = useRef(-1);
  const place = useCallback(() => {
    const g = geo.current;
    let best = -2, bi = 0;
    orbRefs.current.forEach((o, i) => {
      if (!o) return;
      const a = motion.current.base + (i * Math.PI * 2) / n;
      const sin = Math.sin(a);
      const x = g.cx + Math.cos(a) * g.rx, y = g.cy + sin * g.ry;
      o.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.9 + 0.1 * sin})`;
      o.style.zIndex = String(Math.round(10 + sin * 5));
      o.style.opacity = String(0.82 + 0.18 * sin);
      if (sin > best) { best = sin; bi = i; }
    });
    if (bi !== front.current && hubRef.current) {
      front.current = bi;
      hubRef.current.textContent = services[bi]?.name ?? "";
    }
  }, [n, services]);

  useLayoutEffect(() => {
    measure();
    place();
  }, [measure, place]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) motion.current.speed = motion.current.target = 0;
    let raf = 0, last = performance.now(), visible = true;
    const frame = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const m = motion.current;
      m.speed += ((openRef.current >= 0 || reduced ? 0 : m.target) - m.speed) * 0.06;
      if (visible && !document.hidden) {
        m.base += ((Math.PI * 2) / LAP_MS) * dt * m.speed;
        place();
      }
      raf = requestAnimationFrame(frame);
    };
    // Slower while the pointer is over the hero, judged by position so the
    // assistant button floating over it does not count as leaving.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!reduced) motion.current.target = over ? 0.3 : 1;
    };
    const onLeaveWindow = () => { if (!reduced) motion.current.target = 1; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);
    const ro = new ResizeObserver(() => { measure(); place(); });
    ro.observe(hero);
    document.fonts?.ready.then(() => { measure(); place(); });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [measure, place]);

  const show = useCallback((i: number) => {
    window.clearTimeout(closeTimer.current);
    openRef.current = i;
    motion.current.speed = 0; // stop where it is, so the card sits right by its icon
    setShown(i);
    setOpen(i);
  }, []);
  const hide = useCallback((now = false) => {
    window.clearTimeout(closeTimer.current);
    const go = () => {
      openRef.current = -1;
      setOpen(-1);
    };
    if (now) go();
    else closeTimer.current = window.setTimeout(go, 180);
  }, []);

  // Put the open card in the first spot that fits: under or over the icon
  // (whichever faces the middle), the other one, else beside it, inside both
  // the hero and the window. Phones show it as a sheet instead (CSS).
  useLayoutEffect(() => {
    const hero = heroRef.current, card = cardRef.current, orb = orbRefs.current[open];
    if (!hero || !card) return;
    if (open < 0 || geo.current.mobile || !orb) {
      if (open < 0) hero.removeAttribute("data-dim");
      card.style.left = card.style.top = "";
      return;
    }
    const h = hero.getBoundingClientRect(), r = orb.querySelector(".ob-orb-in")!.getBoundingClientRect();
    const W = CARD_W, H = card.offsetHeight || 460, G = 14, TOP = 76, PAD = 16;
    const L = r.left - h.left, T = r.top - h.top, R = L + r.width, B = T + r.height;
    const right = (L + R) / 2 > h.width / 2, upper = (T + B) / 2 < geo.current.cy;
    const BOT = Math.min(h.height, window.innerHeight - h.top) - PAD;
    const clampX = (x: number) => Math.max(PAD, Math.min(h.width - W - PAD, x));
    const clampY = (y: number) => Math.max(TOP, Math.min(BOT - H, y));
    const alignX = clampX(right ? R - W : L);
    const below = { x: alignX, y: B + G, o: `${right ? "100%" : "0%"} 0%` };
    const above = { x: alignX, y: T - H - G, o: `${right ? "100%" : "0%"} 100%` };
    const side = { x: right ? L - W - G : R + G, y: clampY((T + B) / 2 - H / 2), o: `${right ? "100%" : "0%"} 50%` };
    const fits = (c: { x: number; y: number }) => c.y >= TOP && c.y + H <= BOT && c.x >= PAD && c.x + W <= h.width - PAD;
    const pick = (upper ? [below, above, side] : [above, below, side]).find(fits) ?? side;
    card.style.left = `${clampX(pick.x)}px`;
    card.style.top = `${pick.y}px`;
    card.style.transformOrigin = pick.o;
    hero.setAttribute("data-dim", "");
  }, [open]);

  // Escape closes and returns focus; a press anywhere else closes.
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const i = openRef.current;
      hide(true);
      orbRefs.current[i]?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest(".ob-orb, .ob-card")) hide(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, hide]);

  const cur = services[shown];
  const leftFocus = (e: FocusEvent) => {
    const next = e.relatedTarget as Element | null;
    if (!next || !next.closest(".ob-orb, .ob-card")) hide();
  };

  return (
    <section ref={heroRef} className="ob-hero">
      <HeroSky heroRef={heroRef} getState={getState} onPing={onPing} />
      <div ref={coreRef} className="ob-core">
        {children}
      </div>

      <div ref={stageRef} className="ob-stage" role="group" aria-label={labels.group}>
        <div ref={ringRef} className="ob-ring" aria-hidden="true" />
        <div className="ob-hub" aria-hidden="true">
          <HexMark variant="simple" maskId="hexmark-orbit-hub" className="w-[44px] h-[44px] text-lime" />
          <b ref={hubRef}>{services[0]?.name}</b>
        </div>
        {services.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => { orbRefs.current[i] = el; }}
            type="button"
            className={cx("ob-orb", open === i && "is-open")}
            style={{ ["--n" as string]: i }}
            aria-label={s.name}
            aria-expanded={open === i}
            aria-controls="ob-card"
            onPointerEnter={(e) => { if (e.pointerType === "mouse") show(i); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") hide(); }}
            onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show(i); }}
            onBlur={leftFocus}
            onClick={() => (open === i && geo.current.mobile ? hide(true) : show(i))}
          >
            <span className="ob-orb-in">
              <span className="ob-oi"><ServiceIcon id={s.id} /></span>
              <span className="ob-lab">{s.name}</span>
            </span>
          </button>
        ))}
      </div>

      <div
        id="ob-card"
        ref={cardRef}
        className={cx("ob-card", open >= 0 && "is-on")}
        role="region"
        aria-label={cur?.name}
        aria-hidden={open < 0}
        inert={open < 0}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") hide(); }}
        onBlur={leftFocus}
      >
        {cur ? (
          <>
            <button type="button" className="ob-card-x" aria-label={labels.close} onClick={() => hide(true)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            {cur.visual}
            <h3 className="ob-card-h">{cur.name}</h3>
            <p className="ob-card-p">{cur.pitch}</p>
            <ul className="ob-card-list">
              {cur.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
            <div className="ob-card-foot">
              <span className="ob-card-price">{cur.price}</span>
              <Link href={cur.href} className="ob-card-link">
                {labels.seeHow}
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
