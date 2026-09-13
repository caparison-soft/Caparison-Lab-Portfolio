"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui";
import { cx } from "@/lib/cx";

/**
 * The notch: a bone tab hanging from the top edge of the ink bar, with
 * inverted corners either side, holding the primary links. Two of them open a
 * panel that grows out of the tab (work: featured projects, capabilities: the
 * published capabilities). Under lg the same content is a sheet.
 *
 * Owner-supplied reference (a black notch on a white page); rebuilt here with
 * the surfaces inverted for our ink bar, our tokens and our copy. Icons are
 * inline SVG; motion is the site's animation library.
 */

export type NotchProject = { slug: string; title: string; client: string | null; meta: string[] };
export type NotchCapability = { slug: string; title: string; blurb: string };

export type NavPanelId = "work" | "capabilities";

export type NavMenuItem = { href: string; label: string; panel?: NavPanelId };

export type NavMenuProps = {
  items: NavMenuItem[];
  projects: NotchProject[];
  capabilities: NotchCapability[];
  labels: { workAll: string; capabilitiesAll: string; cta: string; menuOpen: string; menuClose: string };
};

const NOTCH_HEIGHT = 48;

function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={cx("transition-transform dur-base", open && "rotate-180", className)}>
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Inverted corner: fills the outside of the tab's top edge so it looks cut from the bar. */
function Corner({ side }: { side: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={cx("pointer-events-none absolute top-0 z-10 text-bone", side === "left" ? "-left-[15px]" : "-right-[15px]")}>
      {side === "left"
        ? <path d="M 20 20 L 20 0 L 0 0 C 11.046 0 20 11.046 20 20 Z" fill="currentColor" />
        : <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" fill="currentColor" />}
    </svg>
  );
}

function PanelBody({ id, projects, capabilities, labels, onNavigate, compact = false }: {
  id: NavPanelId; projects: NotchProject[]; capabilities: NotchCapability[];
  labels: NavMenuProps["labels"]; onNavigate: () => void; compact?: boolean;
}) {
  const card = "site-notch-card group block no-underline rounded-lg border border-divider-light bg-paper p-2 transition-colors dur-fast hover:border-ash";
  if (id === "work") {
    return (
      <div className={cx("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
        {projects.map((p) => (
          <Link key={p.slug} href={`/work/${p.slug}`} className={card} onClick={onNavigate}>
            <span className="block text-body font-medium text-ink">{p.title}</span>
            {p.client ? <span className="mt-0.5 block text-small text-ash">{p.client}</span> : null}
            {p.meta.length ? (
              <span className="data mt-1 flex gap-2 text-small text-ash">
                {p.meta.map((m) => <span key={m}>{m}</span>)}
              </span>
            ) : null}
          </Link>
        ))}
        <Link href="/work" className={cx(card, "flex items-center justify-between text-body font-medium text-ink", !compact && "col-span-2")} onClick={onNavigate}>
          {labels.workAll}
        </Link>
      </div>
    );
  }
  return (
    <div className={cx("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
      {capabilities.map((c) => (
        <Link key={c.slug} href={`/capabilities#${c.slug}`} className={card} onClick={onNavigate}>
          <span className="block text-body font-medium text-ink">{c.title}</span>
          <span className="mt-0.5 block text-small text-ash line-clamp-2">{c.blurb}</span>
        </Link>
      ))}
      <Link href="/capabilities" className={cx(card, "flex items-center justify-between text-body font-medium text-ink", !compact && "col-span-2")} onClick={onNavigate}>
        {labels.capabilitiesAll}
      </Link>
    </div>
  );
}

/** lg+: the notch. */
export function NavNotch(props: NavMenuProps) {
  const { items, labels } = props;
  const [active, setActive] = useState<NavPanelId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => { setActive(null); }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    const onDown = (e: PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setActive(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [active]);

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 28 };
  const fade = reduced ? { duration: 0 } : { duration: 0.18 };

  return (
    <div ref={rootRef} className="site-notch absolute left-1/2 top-0 z-30 hidden w-[640px] -translate-x-1/2 lg:block">
      <Corner side="left" />
      <Corner side="right" />
      <motion.div
        animate={{ height: active ? "auto" : NOTCH_HEIGHT }}
        initial={false}
        transition={spring}
        className="site-notch-tab relative flex w-full flex-col overflow-hidden bg-bone text-ink"
      >
        <nav aria-label="Primary" className="flex h-[48px] flex-none items-center justify-center px-3">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {items.map((item) => (
              <li key={item.href}>
                {item.panel ? (
                  <button
                    type="button"
                    aria-expanded={active === item.panel}
                    aria-controls={`nav-panel-${item.panel}`}
                    onClick={() => setActive(active === item.panel ? null : item.panel!)}
                    className={cx(
                      "inline-flex items-center gap-0.5 rounded-sm px-2 py-1 text-body font-medium transition-colors dur-fast",
                      active === item.panel ? "bg-paper text-ink" : "text-ash hover:text-ink",
                    )}
                  >
                    {item.label}
                    <Chevron open={active === item.panel} />
                  </button>
                ) : (
                  <Link href={item.href} className="inline-flex items-center rounded-sm px-2 py-1 text-body font-medium text-ash hover:text-ink no-underline transition-colors dur-fast">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active}
              id={`nav-panel-${active}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fade}
              className="border-t border-divider-light p-2"
            >
              <PanelBody id={active} projects={props.projects} capabilities={props.capabilities} labels={labels} onNavigate={() => setActive(null)} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Under lg: a text toggle in the bar and a sheet with the links, the same two panels as accordions, and the primary action. */
export function NavSheet(props: NavMenuProps & { children?: ReactNode }) {
  const { items, labels } = props;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavPanelId | null>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => { setOpen(false); setActive(null); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const fade = reduced ? { duration: 0 } : { duration: 0.2 };

  return (
    <div className="lg:hidden ml-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-sheet"
        onClick={() => setOpen((o) => !o)}
        className="text-body font-medium text-bone select-none rounded-sm px-1 -mx-1"
      >
        {open ? labels.menuClose : labels.menuOpen}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="site-sheet"
            aria-label="Primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="site-menu-panel"
          >
            <ul className="list-none m-0 p-0 flex flex-col">
              {items.map((item) => (
                <li key={item.href} className="border-b border-divider-light">
                  {item.panel ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={active === item.panel}
                        onClick={() => setActive(active === item.panel ? null : item.panel!)}
                        className="flex w-full items-center justify-between py-2 text-h3 font-medium text-ink text-left"
                      >
                        {item.label}
                        <Chevron open={active === item.panel} className="w-[16px] h-[16px]" />
                      </button>
                      <AnimatePresence initial={false}>
                        {active === item.panel ? (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={fade} className="overflow-hidden">
                            <div className="pb-2">
                              <PanelBody id={item.panel} projects={props.projects} capabilities={props.capabilities} labels={labels} onNavigate={() => setOpen(false)} compact />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} className="block py-2 text-h3 font-medium text-ink no-underline">{item.label}</Link>
                  )}
                </li>
              ))}
              <li className="pt-3">
                <Button href="/contact">{labels.cta}</Button>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
