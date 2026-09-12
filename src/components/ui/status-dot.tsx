import { cx } from "@/lib/cx";
import type { Surface } from "./types";

export type Status = "live" | "progress" | "draft" | "info" | "warn" | "error";

const fill: Record<Status, string> = {
  live: "bg-status-live",
  progress: "bg-status-progress",
  draft: "bg-status-draft",
  info: "bg-status-info",
  warn: "bg-status-warn",
  error: "bg-status-error",
};

type StatusDotProps = {
  status: Status;
  /** Required. Status is never colour alone. */
  label: string;
  surface?: Surface;
  className?: string;
};

/** The brand dot, 8px, paired with a label. Reused for live, available, in-progress. */
export function StatusDot({ status, label, surface = "light", className }: StatusDotProps) {
  return (
    <span className={cx("inline-flex items-center gap-1", className)}>
      <span aria-hidden="true" className={cx("inline-block w-1 h-1 rounded-full flex-none", fill[status])} />
      <span className={cx("text-small", surface === "dark" ? "text-bone" : "text-ink")}>{label}</span>
    </span>
  );
}
