/**
 * The hero line field: smooth value noise displacing horizontal contour lines,
 * drifting with time and bending away from the pointer. One shared instance
 * per page so the 2D ground canvas and the glass scene's backdrop draw the
 * same lines from the same state.
 */

function makeNoise(seed = 7) {
  const perm = new Uint8Array(512);
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const lattice = (x: number, y: number, z: number) => perm[(perm[(perm[x & 255] + y) & 255] + z) & 255] / 255;
  const fade = (t: number) => t * t * (3 - 2 * t);
  const noise3 = (x: number, y: number, z: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = fade(xf), v = fade(yf), w = fade(zf);
    const l = (dx: number, dy: number, dz: number) => lattice(xi + dx, yi + dy, zi + dz);
    const x0 = l(0, 0, 0) + (l(1, 0, 0) - l(0, 0, 0)) * u;
    const x1 = l(0, 1, 0) + (l(1, 1, 0) - l(0, 1, 0)) * u;
    const x2 = l(0, 0, 1) + (l(1, 0, 1) - l(0, 0, 1)) * u;
    const x3 = l(0, 1, 1) + (l(1, 1, 1) - l(0, 1, 1)) * u;
    const y0 = x0 + (x1 - x0) * v;
    const y1 = x2 + (x3 - x2) * v;
    return (y0 + (y1 - y0) * w) * 2 - 1;
  };
  return (x: number, y: number, z: number) => noise3(x, y, z) * 0.6 + noise3(x * 2.1, y * 2.1, z * 1.3) * 0.3 + noise3(x * 4.3, y * 4.3, z * 1.7) * 0.1;
}

export type LinesField = {
  /** Advance time and ease the pointer. Call once per frame from one owner. */
  tick(): void;
  setPointer(x: number, y: number): void;
  clearPointer(): void;
  /** Draw the field for a hero of size w by h into ctx (ctx may be translated). */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, small?: boolean): void;
};

let instance: LinesField | null = null;

export function getLinesField(): LinesField {
  if (instance) return instance;
  const noise = makeNoise(11);
  let t = 0;
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  instance = {
    tick() {
      t += 0.0035;
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
    },
    setPointer(x, y) { pointer.tx = x; pointer.ty = y; },
    clearPointer() { pointer.tx = -9999; pointer.ty = -9999; },
    draw(ctx, w, h, small = false) {
      const lines = small ? 18 : 34;
      const step = 6;
      const gap = h / (lines + 1);
      const amp = small ? 22 : 38;
      const scale = 0.0022;
      const limeIndex = Math.floor(lines * 0.62);
      for (let i = 0; i < lines; i++) {
        const baseY = gap * (i + 1);
        const lime = i === limeIndex;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const n = noise(x * scale, baseY * scale * 1.6, t);
          let y = baseY + n * amp;
          const dx = x - pointer.x, dy = baseY - pointer.y;
          const d2 = dx * dx + dy * dy;
          const r = 240;
          if (d2 < r * r) {
            const f = 1 - Math.sqrt(d2) / r;
            y += Math.sign(dy || 1) * f * f * 44;
          }
          if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = lime ? 1.25 : 1;
        ctx.strokeStyle = lime ? "rgba(214, 246, 49, 0.42)" : "rgba(168, 176, 156, 0.16)";
        ctx.stroke();
      }
    },
  };
  return instance;
}
