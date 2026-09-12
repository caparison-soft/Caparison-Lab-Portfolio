import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type DividerProps = { surface?: Surface; className?: string };

/** Hairline. Separates items in a sequence. Never decorative. */
export function Divider({ surface = "light", className }: DividerProps) {
  return <hr className={cx("border-0 border-t m-0", surface === "dark" ? "border-olive-600" : "border-divider-light", className)} />;
}
