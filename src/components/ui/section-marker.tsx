import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type SectionMarkerProps = {
  /** Lowercase route-style slug: work, capabilities, process. */
  children: string;
  /** Optional count shown in mono, e.g. 12. */
  count?: number | string;
  surface?: Surface;
  as?: "p" | "span" | "h2";
  id?: string;
  className?: string;
};

/** The section marker. Satoshi Medium, lowercase, secondary colour. Never mono, never caps. */
export function SectionMarker({ children, count, surface = "light", as: Tag = "p", id, className }: SectionMarkerProps) {
  return (
    <Tag id={id} className={cx("text-body font-medium leading-none m-0 max-w-none", surface === "dark" ? "text-sage" : "text-ash", className)}>
      {children}
      {count !== undefined ? <span className={cx("data ml-1", surface === "dark" ? "text-sage" : "text-ash")}>{count}</span> : null}
    </Tag>
  );
}
