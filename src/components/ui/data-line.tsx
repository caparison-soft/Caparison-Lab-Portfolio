import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

export type DataItem = { label?: string; value: ReactNode };

type DataLineProps = {
  items: DataItem[];
  surface?: Surface;
  /** row = inline, for index rows. stack = one per line, for the case-page spine. */
  direction?: "row" | "stack";
  className?: string;
};

/**
 * Genuine data in mono with tabular numbers. Labels, when present, are
 * Satoshi small in the secondary colour. No separator glyphs between items.
 */
export function DataLine({ items, surface = "light", direction = "row", className }: DataLineProps) {
  const muted = surface === "dark" ? "text-sage" : "text-ash";
  const strong = surface === "dark" ? "text-bone" : "text-ink";
  return (
    <dl className={cx("m-0", direction === "row" ? "flex flex-wrap gap-x-3 gap-y-1" : "flex flex-col gap-2", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-0 min-w-0">
          {item.label ? <dt className={cx("text-small", muted)}>{item.label}</dt> : null}
          <dd className={cx("data m-0", strong)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
