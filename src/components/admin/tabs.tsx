"use client";
// Client component: tab state. The active tab carries a 2px lime rule.

import { cx } from "@/lib/cx";

export type TabDef = { id: string; label: string; badge?: number | string; error?: boolean };

export function Tabs({ tabs, active, onChange, idPrefix = "tab" }: { tabs: TabDef[]; active: string; onChange: (id: string) => void; idPrefix?: string }) {
  return (
    <div role="tablist" aria-label="Sections" className="flex flex-wrap gap-x-3 border-b border-divider-light">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            id={`${idPrefix}-${t.id}`}
            aria-selected={on}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            type="button"
            onClick={() => onChange(t.id)}
            className={cx(
              "relative py-1 text-small font-medium transition-colors dur-fast -mb-px border-b-2",
              on ? "text-ink border-lime" : "text-ash border-transparent hover:text-ink",
            )}
          >
            {t.label}
            {t.badge !== undefined ? <span className="ml-1 data text-mono-s text-ash">{t.badge}</span> : null}
            {t.error ? <span className="ml-1 inline-block w-1 h-1 rounded-full bg-status-error align-middle" aria-label="has errors" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, active, idPrefix = "tab", children }: { id: string; active: string; idPrefix?: string; children: React.ReactNode }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-${id}`} hidden={active !== id} className="pt-3">
      {children}
    </div>
  );
}
