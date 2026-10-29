// Whatever the hero is waiting on reports here, so the load screen knows when
// the page is whole: "pending" until it decides, "ready" once the hero's own
// picture is drawn, "off" when there is nothing to wait for (reduced motion,
// no hero on this route, an error). Held on window so the value survives
// whichever component mounts first; the load screen reads the current value
// and subscribes for the rest. It carried the 3D glass logo until
// 2026-10-29; the rotating case card took that place and the contract did
// not change.

export type HeroState = "pending" | "ready" | "off";

type Store = { state: HeroState; listeners: Set<(s: HeroState) => void> };
const KEY = "__caparisonHero";

function store(): Store {
  const w = window as Window & { [KEY]?: Store };
  if (!w[KEY]) w[KEY] = { state: "pending", listeners: new Set() };
  return w[KEY];
}

export function setHeroState(next: HeroState): void {
  if (typeof window === "undefined") return;
  const s = store();
  if (s.state === next) return;
  s.state = next;
  s.listeners.forEach((fn) => fn(next));
}

/** Current value now, then every change; returns the unsubscribe. */
export function onHeroState(fn: (s: HeroState) => void): () => void {
  const s = store();
  fn(s.state);
  s.listeners.add(fn);
  return () => { s.listeners.delete(fn); };
}
