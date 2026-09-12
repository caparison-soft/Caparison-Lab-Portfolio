import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import { controlBase, controlSurface } from "./input";
import type { Surface } from "./types";

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & { surface?: Surface };

export function Textarea({ surface = "light", className, rows = 5, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cx(controlBase, controlSurface[surface], "px-2 py-1 min-h-[120px] resize-y", className)}
      {...rest}
    />
  );
}
