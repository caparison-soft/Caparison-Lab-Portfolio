// The hero glass reports where it is so the preloader knows when the page is
// whole: "pending" until the glass decides, "ready" once the 3D logo is
// drawing, "off" when it will not run (phones, reduced motion, no WebGL, an
// error). Held on window so the value survives whichever component mounts
// first; the preloader reads the current value and subscribes for the rest.

export type GlassState = "pending" | "ready" | "off";

type Store = { state: GlassState; listeners: Set<(s: GlassState) => void> };
const KEY = "__caparisonGlass";

function store(): Store {
  const w = window as Window & { [KEY]?: Store };
  if (!w[KEY]) w[KEY] = { state: "pending", listeners: new Set() };
  return w[KEY];
}

export function setGlassState(next: GlassState): void {
  if (typeof window === "undefined") return;
  const s = store();
  if (s.state === next) return;
  s.state = next;
  s.listeners.forEach((fn) => fn(next));
}

/** Current value now, then every change; returns the unsubscribe. */
export function onGlassState(fn: (s: GlassState) => void): () => void {
  const s = store();
  fn(s.state);
  s.listeners.add(fn);
  return () => { s.listeners.delete(fn); };
}
