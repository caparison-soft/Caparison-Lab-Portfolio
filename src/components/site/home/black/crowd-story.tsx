"use client";
// Client component: the crowd story above the footer (owner, 2026-11-07,
// ported from the earlier prototype onto the black page). A pinned scroll
// scene on one canvas: people walk past a shop; the owner rings Caparison Lab;
// the pieces we set up fly from our mark to the shop; the shop lights up, its
// door opens and most of the crowd walks in while the rest queue. As the story
// ends the ground turns from black to Emerald, so it runs straight into the
// footer: its heading, line and buttons rise in over the scene's sky as the
// scroll ends, and on wide screens the services fly back out while the
// footer's columns (pages, elsewhere, our time) take their places either side
// of the shop (owner, 2026-11-07). The footer below hides its own copy of
// whatever this scene shows. On the home page this scene is the footer: the
// page ends here (owner, 2026-11-07), with the copyright along the bottom.
// The pieces that fly in are our six services, named. A caption pill and step
// dots carry the story in words; the same captions sit in a screen-reader paragraph, since the
// canvas is decorative. Colours come from the tokens at mount. Reduced motion:
// no pinning, the finished scene, still.

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { LocalTime } from "@/components/site/local-time";

export type CrowdCopy = {
  label: string;
  captions: string[];
  sign: string;
  open: string;
  ask: string;
  reply: string;
  /** The six services, in orbit order: websites, automation, CRM, pipeline, production, ads. */
  pieces: string[];
  studio: string;
  /** The footer's opening, shown over the scene once the story ends. */
  end: { heading: string; sub: string; cta: string; ctaHref: string; email: string };
  /** The copyright line along the bottom of the scene (the page ends here). */
  legal: { left: string; right: string };
  /** The footer's columns, placed either side of the shop at the end (wide screens). */
  columns: {
    pagesLabel: string;
    pages: { href: string; label: string }[];
    reachLabel: string;
    reach: { href: string; label: string; external: boolean }[];
    timeLabel: string;
    timeZone: string;
    location: string;
  };
};

type Palette = { lime: string; em: string; em8: string; em6: string; em4: string; bone: string; paper: string; ink: string; sage: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sstep = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const easeBack = (t: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const rgba = (c: string, a: number) => `rgba(${hex(c).join(",")},${a})`;
const mixColor = (a: string, b: string, t: number) => { const pa = hex(a), pb = hex(b); return `rgb(${pa.map((v, i) => Math.round(mix(v, pb[i], clamp(t)))).join(",")})`; };

type Person = { lane: number; dir: number; speed: number; x0: number; phase: number; h: number; shirt: string; goIn: boolean; start: number; side: number; slot: number; px: number | null };

export function CrowdStory({ copy }: { copy: CrowdCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current, cv = canvasRef.current;
    if (!section || !stage || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const v = (n: string, f: string) => (css.getPropertyValue(n).trim() || f).toUpperCase();
    const C: Palette = {
      lime: v("--color-lime", "#CDFF9B"), em: v("--color-olive-950", "#203D43"), em8: v("--color-olive-800", "#2A4C53"),
      em6: v("--color-olive-600", "#3E646B"), em4: v("--color-olive-400", "#6F9C77"), bone: v("--color-bone", "#ECEEE8"),
      paper: v("--color-paper", "#FAFBF7"), ink: v("--color-ink", "#000000"), sage: v("--color-sage", "#A9C2C4"),
    };
    // Canvas needs real family names; next/font hides them behind variables.
    const sans = getComputedStyle(document.body).fontFamily;
    const display = css.getPropertyValue("--font-archivo").trim() || sans;

    let W = 0, H = 0, S = 1, baseY = 0, people: Person[] = [], sky: { x: number; y: number; r: number; a: number; ph: number; sp: number; leaf: boolean }[] = [];
    let skyFade = 0;
    const store = () => {
      const w = 290 * S, h = 200 * S, signH = 46 * S;
      const x = W / 2 - w / 2, top = baseY - h;
      return { w, h, x, top, signTop: top - signH, signH, doorX: W / 2, doorW: 54 * S, doorH: 112 * S };
    };
    const laneY = (lane: number) => baseY + (16 + lane * 20) * S;
    const laneScale = (lane: number) => (0.78 + lane * 0.14) * S;

    const build = () => {
      const n = W < 700 ? 42 : 96;
      const r = rng(1234567);
      const shirts = [C.em6, C.em4, C.sage, C.em8, C.em4, C.em6, C.lime];
      people = Array.from({ length: n }, () => ({
        lane: Math.floor(r() * 3), dir: r() < 0.5 ? -1 : 1, speed: 26 + r() * 34, x0: r() * (W + 240), phase: r() * 10,
        h: 46 + r() * 12, shirt: shirts[Math.floor(r() * shirts.length)], goIn: r() < 0.62, start: 0.6 + r() * 0.22, side: 0, slot: 0, px: null,
      }));
      // Stars above the skyline.
      const rs = rng(777);
      sky = Array.from({ length: Math.round((W * baseY) / 6000) }, () => ({
        x: rs() * W, y: rs() * (baseY - 120 * S), r: 0.3 + rs() * 0.9, a: 0.2 + rs() * 0.5, ph: rs() * 6.3, sp: 0.6 + rs() * 1.8, leaf: rs() < 0.15,
      }));
      let L = 0, R = 0;
      people.filter((p) => !p.goIn).sort((a, b) => a.start - b.start).forEach((p, i) => {
        p.side = i % 2 ? 1 : -1;
        p.slot = p.side < 0 ? L++ : R++;
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = clamp(Math.min(W / 1300, H / 900), 0.58, 1.05);
      // The scene sits low; the sky above it holds the footer's words at the end.
      baseY = H * (W < 700 ? 0.84 : 0.8);
      build();
      const cols = colsRef.current;
      if (cols) {
        const st = store();
        cols.style.setProperty("--shop-l", `${st.x - 10 * S}px`);
        cols.style.setProperty("--shop-r", `${W - (st.x + st.w + 10 * S)}px`);
        // Both columns share a top, set so the taller one ends above the crowd's
        // heads and nothing they say sits on a person.
        const tall = Math.max(...[...cols.querySelectorAll<HTMLElement>(".cs-col")].map((c) => c.offsetHeight), 0);
        cols.style.setProperty("--cols-top", `${baseY - 74 * S - tall}px`);
      }
    };

    const rr = (x: number, y: number, w: number, h: number, r: number) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

    const drawGround = (t: number) => {
      for (const st of sky) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * st.sp + st.ph);
        ctx.fillStyle = rgba(st.leaf ? C.lime : C.bone, st.a * tw * (1 - 0.45 * skyFade));
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = rgba(C.bone, 0.035);
      const r = rng(42);
      for (let x = -20; x < W; x += 70 * S + r() * 60 * S) {
        const bh = (60 + r() * 140) * S;
        rr(x, baseY - bh, (50 + r() * 50) * S, bh + 4, 4 * S); ctx.fill();
      }
      ctx.fillStyle = rgba(C.bone, 0.05); ctx.fillRect(0, baseY, W, 80 * S);
      ctx.fillStyle = rgba(C.bone, 0.12); ctx.fillRect(0, baseY + 80 * S, W, 2);
    };

    const drawStore = (lit: number, doorOpen: number) => {
      const s = store();
      if (lit > 0) {
        const g = ctx.createRadialGradient(W / 2, baseY - s.h / 2, 10, W / 2, baseY - s.h / 2, 380 * S);
        g.addColorStop(0, rgba(C.lime, 0.35 * lit)); g.addColorStop(1, rgba(C.lime, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = mixColor(C.em8, C.em6, lit); ctx.strokeStyle = rgba(C.bone, 0.35); ctx.lineWidth = 2;
      rr(s.x, s.top, s.w, s.h, 6 * S); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.em; rr(s.x - 10 * S, s.signTop, s.w + 20 * S, s.signH, 8 * S); ctx.fill();
      ctx.strokeStyle = rgba(C.bone, 0.25); ctx.stroke();
      ctx.fillStyle = lit > 0.5 ? C.lime : C.sage;
      ctx.font = `${Math.round(22 * S)}px ${display}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(copy.sign, W / 2, s.signTop + s.signH / 2 + 1);
      const aw = s.w + 20 * S, ax = s.x - 10 * S, ay = s.top, ah = 28 * S, n = 9;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? C.bone : C.em6;
        ctx.beginPath();
        const x0 = ax + (aw / n) * i, x1 = x0 + aw / n;
        ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.lineTo(x1, ay + ah * 0.7);
        ctx.quadraticCurveTo((x0 + x1) / 2, ay + ah * 1.25, x0, ay + ah * 0.7); ctx.closePath(); ctx.fill();
      }
      const wy = s.top + 48 * S, ww = 74 * S, wh = 70 * S;
      for (const wx of [s.x + 22 * S, s.x + s.w - 22 * S - ww]) {
        ctx.fillStyle = mixColor(C.em, C.lime, lit);
        rr(wx, wy, ww, wh, 4 * S); ctx.fill();
        ctx.strokeStyle = rgba(C.bone, 0.4); ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
      }
      if (lit > 0.6) {
        ctx.globalAlpha = sstep(0.6, 0.9, lit);
        ctx.fillStyle = C.em; rr(s.x + 34 * S, wy + 22 * S, 50 * S, 22 * S, 4 * S); ctx.fill();
        ctx.fillStyle = C.lime; ctx.font = `700 ${Math.round(11 * S)}px ${sans}`;
        ctx.fillText(copy.open, s.x + 59 * S, wy + 33 * S);
        ctx.globalAlpha = 1;
      }
      const dx = s.doorX - s.doorW / 2, dy = baseY - s.doorH;
      ctx.fillStyle = mixColor(C.em, C.lime, lit * 0.85); rr(dx, dy, s.doorW, s.doorH, 4 * S); ctx.fill();
      ctx.fillStyle = C.em; rr(dx + s.doorW * 0.8 * doorOpen, dy, s.doorW * (1 - 0.8 * doorOpen), s.doorH, 4 * S); ctx.fill();
      ctx.strokeStyle = rgba(C.bone, 0.3); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(dx + s.doorW * 0.8 * doorOpen + 8 * S, dy + s.doorH / 2, 3 * S, 0, 7); ctx.fill();
      if (lit > 0) {
        ctx.fillStyle = rgba(C.lime, 0.45 * lit);
        ctx.beginPath(); ctx.ellipse(s.doorX, baseY + 6 * S, 70 * S, 10 * S, 0, 0, 7); ctx.fill();
      }
    };

    const drawPerson = (x: number, y: number, h: number, sc: number, facing: number, step: number, amp: number, shirt: string, alpha: number) => {
      const Hh = h * sc;
      ctx.globalAlpha = alpha;
      const hip = y - Hh * 0.42, sw = Math.sin(step) * 0.5 * amp;
      ctx.strokeStyle = C.bone; ctx.lineWidth = Math.max(2, Hh * 0.08); ctx.lineCap = "round";
      for (const k of [1, -1]) {
        ctx.beginPath(); ctx.moveTo(x, hip);
        ctx.lineTo(x + Math.sin(sw * k) * Hh * 0.42 * facing, y - Math.abs(Math.cos(sw * k)) * 0.02 * Hh); ctx.stroke();
      }
      const bob = Math.abs(Math.sin(step)) * 1.5 * amp;
      ctx.fillStyle = shirt;
      rr(x - Hh * 0.14, y - Hh * 0.86 - bob, Hh * 0.28, Hh * 0.48, Hh * 0.14); ctx.fill();
      ctx.strokeStyle = C.bone; ctx.lineWidth = Math.max(1.5, Hh * 0.06);
      ctx.beginPath(); ctx.moveTo(x, y - Hh * 0.78 - bob);
      ctx.lineTo(x - Math.sin(sw) * Hh * 0.3 * facing, y - Hh * 0.52 - bob); ctx.stroke();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(x + facing * Hh * 0.02, y - Hh * 0.98 - bob, Hh * 0.11, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    };

    const personAt = (p: Person, t: number, prog: number) => {
      const s = store();
      const span = W + 240;
      const wx = ((p.x0 + p.dir * p.speed * S * t) % span + span) % span - 120;
      const wy = laneY(p.lane);
      const b = sstep(p.start, p.start + 0.14, prog);
      if (b <= 0) return { x: wx, y: wy, sc: laneScale(p.lane), facing: p.dir, amp: 1, alpha: 1, lane: p.lane };
      let tx: number, ty: number, sc: number, alpha = 1, amp = 1;
      if (p.goIn) {
        const a = clamp(b / 0.75), c = clamp((b - 0.75) / 0.25);
        const ax = s.doorX + (wx < s.doorX ? -26 : 26) * S, ay = laneY(1);
        tx = mix(mix(wx, ax, a), s.doorX, c); ty = mix(mix(wy, ay, a), baseY + 2 * S, c);
        sc = mix(mix(laneScale(p.lane), laneScale(1), a), laneScale(0) * 0.85, c);
        alpha = 1 - sstep(0.7, 1, c);
        if (b >= 1) amp = 0;
      } else {
        const qx = s.doorX + p.side * (64 + p.slot * 24) * S, qy = laneY(1);
        tx = mix(wx, qx, b); ty = mix(wy, qy, b); sc = mix(laneScale(p.lane), laneScale(1), b);
        amp = b >= 1 ? 0 : 1;
      }
      const facing = p.px == null ? p.dir : Math.abs(tx - p.px) < 0.05 ? (p.goIn ? p.dir : -p.side) : Math.sign(tx - p.px);
      return { x: tx, y: ty, sc, facing, amp, alpha, lane: b > 0.5 ? 1 : p.lane };
    };

    const icon = (kind: string, x: number, y: number, r: number, k: number) => {
      if (k <= 0) return;
      const sc = easeBack(clamp(k));
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      ctx.fillStyle = C.paper; ctx.strokeStyle = C.em; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      const u = r / 22;
      if (kind === "web") { rr(-12 * u, -9 * u, 24 * u, 18 * u, 3 * u); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12 * u, -4 * u); ctx.lineTo(12 * u, -4 * u); ctx.stroke(); ctx.fillStyle = C.lime; rr(-7 * u, 1 * u, 10 * u, 4 * u, 2 * u); ctx.fill(); ctx.stroke(); }
      if (kind === "cal") { rr(-11 * u, -10 * u, 22 * u, 20 * u, 3 * u); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-11 * u, -4 * u); ctx.lineTo(11 * u, -4 * u); ctx.stroke(); ctx.fillStyle = C.lime; ctx.fillRect(1 * u, 0, 6 * u, 5 * u); ctx.strokeRect(1 * u, 0, 6 * u, 5 * u); }
      if (kind === "pin") { ctx.beginPath(); ctx.moveTo(0, 12 * u); ctx.bezierCurveTo(-12 * u, -2 * u, -9 * u, -12 * u, 0, -12 * u); ctx.bezierCurveTo(9 * u, -12 * u, 12 * u, -2 * u, 0, 12 * u); ctx.fillStyle = C.lime; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -3 * u, 3.5 * u, 0, 7); ctx.fillStyle = C.em; ctx.fill(); }
      if (kind === "play") { ctx.fillStyle = C.em; ctx.beginPath(); ctx.moveTo(-5 * u, -8 * u); ctx.lineTo(9 * u, 0); ctx.lineTo(-5 * u, 8 * u); ctx.closePath(); ctx.fill(); }
      if (kind === "star") { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? 5 * u : 11 * u; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); ctx.fillStyle = C.lime; ctx.fill(); ctx.stroke(); }
      if (kind === "board") { ctx.fillStyle = C.lime; for (const [bx, bh] of [[-9, 8], [-2, 13], [5, 18]]) { rr(bx * u, (9 - bh) * u, 5 * u, bh * u, 1.5 * u); ctx.fill(); ctx.stroke(); } }
      if (kind === "ads") { ctx.beginPath(); ctx.moveTo(-10 * u, -4 * u); ctx.lineTo(-4 * u, -4 * u); ctx.lineTo(7 * u, -10 * u); ctx.lineTo(7 * u, 10 * u); ctx.lineTo(-4 * u, 4 * u); ctx.lineTo(-10 * u, 4 * u); ctx.closePath(); ctx.fillStyle = C.lime; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6 * u, 4 * u); ctx.lineTo(-4 * u, 11 * u); ctx.stroke(); }
      if (kind === "chat") { rr(-11 * u, -9 * u, 22 * u, 15 * u, 5 * u); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4 * u, 6 * u); ctx.lineTo(-7 * u, 11 * u); ctx.lineTo(2 * u, 6 * u); ctx.stroke(); }
      ctx.restore();
    };

    const bubble = (text: string, x: number, y: number, k: number, tail: number) => {
      if (k <= 0) return;
      const fs = Math.max(11, 14 * S);
      ctx.font = `500 ${fs}px ${sans}`;
      const w = ctx.measureText(text).width + 28, h = fs + 20;
      const bx = clamp(x - w / 2, 10, W - w - 10);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 10);
      ctx.fillStyle = C.paper; ctx.strokeStyle = C.em; ctx.lineWidth = 1.5;
      rr(bx, y - h, w, h, h / 2); ctx.fill(); ctx.stroke();
      const tx = clamp(x + tail, bx + 18, bx + w - 18);
      ctx.beginPath(); ctx.moveTo(tx - 7, y - 1); ctx.lineTo(tx, y + 9); ctx.lineTo(tx + 7, y - 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.em; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, bx + w / 2, y - h / 2 + 1);
      ctx.restore();
    };

    // Our mark on black: the brand's single-colour hex in Leaf, the aperture
    // cut to the ground, the spark left standing (full colour is only for
    // bone, paper or Emerald grounds).
    const hexMark = (x: number, y: number, r: number) => {
      ctx.save(); ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 3; ctx.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); }
      ctx.closePath(); ctx.fillStyle = C.lime; ctx.lineJoin = "round"; ctx.lineWidth = r * 0.18; ctx.strokeStyle = C.lime; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.47, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); const q = r * 0.38;
      ctx.moveTo(0, -q); ctx.quadraticCurveTo(q * 0.15, -q * 0.15, q, 0); ctx.quadraticCurveTo(q * 0.15, q * 0.15, 0, q);
      ctx.quadraticCurveTo(-q * 0.15, q * 0.15, -q, 0); ctx.quadraticCurveTo(-q * 0.15, -q * 0.15, 0, -q); ctx.fillStyle = C.lime; ctx.fill();
      ctx.restore();
    };

    // Our six services, in orbit order: websites, AI automation, CRM and dashboard,
    // content pipeline, content production, ads and marketing.
    const KINDS = ["web", "chat", "board", "cal", "play", "ads"];
    const SPOTS: [number, number][] = [[-1, 0.12], [-1, 0.52], [-1, 0.92], [1, 0.12], [1, 0.52], [1, 0.92]];
    let target = 0, prog = reduced ? 1 : 0, raf = 0, visible = true, lastStage = -1, lastGround = -1;
    const t0 = performance.now();

    const readScroll = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      target = span > 0 ? clamp(-r.top / span) : 1;
    };

    const draw = (now: number) => {
      const t = reduced ? 3 : (now - t0) / 1000;
      if (!reduced) prog += (target - prog) * 0.09;
      const s = store();
      ctx.clearRect(0, 0, W, H);
      skyFade = sstep(0.82, 1, prog);
      drawGround(t);
      const lit = sstep(0.56, 0.64, prog), doorOpen = sstep(0.6, 0.66, prog);
      const states = people.map((p) => ({ p, st: personAt(p, t, prog) }));
      drawStore(lit, doorOpen);

      // The owner at the door, ringing us.
      const own = sstep(0.18, 0.26, prog) * (1 - sstep(0.6, 0.64, prog));
      if (own > 0) {
        const ox = s.doorX + 44 * S;
        drawPerson(ox, baseY + 4 * S, 58, S * 0.95, -1, 0, 0, C.lime, own);
        bubble(copy.ask, ox, baseY - 118 * S, sstep(0.23, 0.28, prog) * (1 - sstep(0.4, 0.44, prog)), -10);
        const ring = sstep(0.22, 0.27, prog) * (1 - sstep(0.4, 0.44, prog));
        if (ring > 0) {
          const bx = ox + 18 * S, by = baseY - 92 * S;
          ctx.globalAlpha = ring;
          ctx.fillStyle = C.lime; rr(bx - 18 * S, by - 18 * S, 36 * S, 36 * S, 10 * S); ctx.fill();
          ctx.strokeStyle = C.em; ctx.lineWidth = 2.5 * S;
          ctx.beginPath(); ctx.moveTo(bx - 6 * S, by - 7 * S); ctx.quadraticCurveTo(bx - 8 * S, by + 6 * S, bx + 6 * S, by + 8 * S); ctx.stroke();
          const pulse = (t * 1.6) % 1;
          ctx.strokeStyle = rgba(C.lime, (1 - pulse) * ring); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(bx, by, (22 + pulse * 18) * S, -1.2, -0.2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // The line to us, and our mark.
      const call = sstep(0.27, 0.34, prog) * (1 - sstep(0.62, 0.68, prog));
      const nx = Math.min(W - 90 * S, s.x + s.w + 300 * S), ny = s.signTop - 40 * S;
      if (call > 0) {
        const sx = s.doorX + 62 * S, sy = baseY - 110 * S;
        ctx.globalAlpha = call;
        ctx.setLineDash([6 * S, 7 * S]); ctx.lineDashOffset = -t * 30;
        ctx.strokeStyle = rgba(C.bone, 0.6); ctx.lineWidth = 2;
        const k = sstep(0.27, 0.34, prog), ex = mix(sx, nx, k), ey = mix(sy, ny, k);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + ex) / 2, Math.min(sy, ey) - 80 * S, ex, ey); ctx.stroke();
        ctx.setLineDash([]);
        hexMark(nx, ny, 26 * S * easeBack(sstep(0.31, 0.36, prog)) + 0.01);
        ctx.fillStyle = C.bone; ctx.font = `700 ${Math.round(13 * S)}px ${sans}`; ctx.textAlign = "center";
        ctx.fillText(copy.studio, nx, ny + 44 * S);
        ctx.globalAlpha = 1;
        bubble(copy.reply, nx, ny - 40 * S, sstep(0.34, 0.38, prog) * (1 - sstep(0.44, 0.48, prog)), 0);
      }

      // What we set up, flying from our mark to the shop, named once landed.
      KINDS.forEach((kind, i) => {
        const k = sstep(0.42 + i * 0.026, 0.5 + i * 0.026, prog);
        // On wide screens they fly back out as the story ends, making room for the footer's columns.
        const out = W >= 900 ? sstep(0.84 + i * 0.008, 0.9 + i * 0.008, prog) : 0;
        if (k <= 0 || out >= 1) return;
        ctx.globalAlpha = 1 - out;
        const [side, f] = SPOTS[i];
        const sx = s.doorX + side * (s.w / 2 + 64 * S), sy = mix(s.signTop + 10 * S, baseY - 46 * S, f);
        const cx = (nx + sx) / 2, cy = Math.min(ny, sy) - 120 * S;
        const e = k;
        const ix = (1 - e) * (1 - e) * nx + 2 * (1 - e) * e * cx + e * e * sx;
        const iy = (1 - e) * (1 - e) * ny + 2 * (1 - e) * e * cy + e * e * sy + (k >= 1 ? Math.sin(t * 1.5 + i) * 3 * S : 0) - out * 40 * S;
        if (k >= 1) {
          ctx.strokeStyle = rgba(C.bone, 0.25); ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]);
          ctx.beginPath(); ctx.moveTo(ix - side * 22 * S, iy); ctx.lineTo(s.doorX + side * s.w / 2, iy); ctx.stroke(); ctx.setLineDash([]);
        }
        icon(kind, ix, iy, 22 * S, Math.max(0.35, k));
        const lk = sstep(0.85, 1, k) * (1 - out), label = copy.pieces[i] ?? "";
        if (lk > 0 && W >= 700 && label) {
          ctx.globalAlpha = lk;
          const fs = Math.max(11, 13 * S); ctx.font = `700 ${fs}px ${sans}`;
          const tw = ctx.measureText(label).width + 20, th = fs + 12;
          const lx = side < 0 ? ix - 30 * S - tw : ix + 30 * S;
          ctx.fillStyle = C.lime; rr(lx, iy - th / 2, tw, th, th / 2); ctx.fill();
          ctx.fillStyle = C.em; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, lx + tw / 2, iy + 1);
        }
        ctx.globalAlpha = 1;
      });

      // The crowd, back lane to front, over the shop.
      for (const lane of [0, 1, 2]) for (const { p, st } of states) {
        if (st.lane !== lane || st.alpha <= 0.01) continue;
        drawPerson(st.x, st.y, p.h, st.sc, st.facing, t * 7 + p.phase, st.amp, p.shirt, st.alpha);
      }
      for (const { p, st } of states) p.px = st.x;

      // Words: caption, dots, counter; and the ground turns Emerald at the end.
      const stageN = prog < 0.2 ? 0 : prog < 0.42 ? 1 : prog < 0.62 ? 2 : 3;
      if (stageN !== lastStage) {
        lastStage = stageN;
        if (capRef.current) capRef.current.textContent = copy.captions[stageN] ?? "";
        dotsRef.current?.querySelectorAll("span").forEach((d, i) => d.classList.toggle("is-on", i === stageN));
      }
      const ended = prog > 0.9;
      endRef.current?.classList.toggle("is-on", ended);
      colsRef.current?.classList.toggle("is-on", ended);
      stage.classList.toggle("is-ended", ended);
      const ground = Math.round(sstep(0.82, 1, prog) * 100) / 100;
      if (ground !== lastGround) {
        lastGround = ground;
        stage.style.backgroundColor = mixColor(C.ink, C.em, ground);
      }
    };

    const frame = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => { resize(); if (reduced) draw(performance.now()); };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", readScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "200px" });
    io.observe(section);
    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      resize(); readScroll();
      if (reduced) draw(performance.now());
      else raf = requestAnimationFrame(frame);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", readScroll);
    };
  }, [copy]);

  return (
    <section ref={sectionRef} className="cs-section" aria-label={copy.label}>
      <div ref={stageRef} className="cs-stage">
        <canvas ref={canvasRef} className="cs-canvas" aria-hidden="true" />
        {/* The footer's opening rises in over the sky when the story ends. */}
        <div ref={endRef} className="cs-end">
          <h2 className="cs-end-h">
            <span className="sr-only">{copy.end.heading}</span>
            <span aria-hidden="true">
              {copy.end.heading.split(/\s+/).map((w, i) => (
                <Fragment key={i}>
                  <span className="cs-w"><span style={{ ["--i" as string]: i }}>{w}</span></span>{" "}
                </Fragment>
              ))}
            </span>
          </h2>
          <p className="cs-end-sub">{copy.end.sub}</p>
          <div className="cs-end-actions">
            <ArrowFillButton label={copy.end.cta} href={copy.end.ctaHref} />
            <a href={`mailto:${copy.end.email}`} className="cs-end-mail">{copy.end.email}</a>
          </div>
        </div>
        {/* The footer's columns, either side of the shop (wide screens only). */}
        <div ref={colsRef} className="cs-cols">
          <nav aria-label={copy.columns.pagesLabel} className="cs-col cs-col--l">
            <p className="cs-col-label">{copy.columns.pagesLabel}</p>
            <ul>
              {copy.columns.pages.map((l, i) => (
                <li key={l.href} style={{ ["--i" as string]: i }}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="cs-col cs-col--r">
            <p className="cs-col-label">{copy.columns.reachLabel}</p>
            <ul>
              {copy.columns.reach.map((l, i) => (
                <li key={l.href} style={{ ["--i" as string]: i }}>
                  {l.external ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a> : <a href={l.href}>{l.label}</a>}
                </li>
              ))}
            </ul>
            <p className="cs-col-label cs-col-time" style={{ ["--i" as string]: copy.columns.reach.length }}>{copy.columns.timeLabel}</p>
            <p className="cs-col-clock" style={{ ["--i" as string]: copy.columns.reach.length + 1 }}>
              <LocalTime timeZone={copy.columns.timeZone} /> {copy.columns.location}
            </p>
          </div>
        </div>
        <div className="cs-legal">
          <span>{copy.legal.left}</span>
          <span>{copy.legal.right}</span>
        </div>
        <div className="cs-caption" aria-hidden="true">
          <span ref={capRef}>{copy.captions[0]}</span>
        </div>
        <div ref={dotsRef} className="cs-dots" aria-hidden="true">
          {copy.captions.map((_, i) => <span key={i} className={i === 0 ? "is-on" : undefined} />)}
        </div>
        {/* The story in words, for screen readers. */}
        <ol className="sr-only">
          {copy.captions.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </div>
    </section>
  );
}
