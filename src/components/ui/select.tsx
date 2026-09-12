import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import { controlBase, controlSurface } from "./input";
import type { Surface } from "./types";

export type SelectProps = ComponentPropsWithoutRef<"select"> & { surface?: Surface };

// Chevron drawn in the surface's text colour (ink on light, bone on dark).
const chevron: Record<Surface, string> = {
  light: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%23000000' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
  dark: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%23ECEEE8' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
};

/** Native select, styled. Native so it works on every phone keyboard and screen reader. */
export function Select({ surface = "light", className, children, ...rest }: SelectProps) {
  return (
    <select
      className={cx(controlBase, controlSurface[surface], "h-[40px] pl-2 pr-4 appearance-none bg-no-repeat", className)}
      style={{ backgroundImage: chevron[surface], backgroundPosition: "right 8px center" }}
      {...rest}
    >
      {children}
    </select>
  );
}
