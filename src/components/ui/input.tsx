import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

export const controlBase =
  "block w-full rounded-sm text-body transition-colors dur-fast ease-out " +
  "disabled:opacity-50 disabled:cursor-not-allowed read-only:cursor-default";

export const controlSurface: Record<Surface, string> = {
  light:
    "bg-paper text-ink border border-divider-light placeholder:text-ash hover:border-ash " +
    "aria-invalid:border-status-error aria-invalid:hover:border-status-error",
  dark:
    "on-dark bg-olive-800 text-bone border border-olive-600 placeholder:text-sage hover:border-sage " +
    "aria-invalid:border-status-warn aria-invalid:hover:border-status-warn",
};

export type InputProps = ComponentPropsWithoutRef<"input"> & { surface?: Surface };

export function Input({ surface = "light", className, ...rest }: InputProps) {
  return <input className={cx(controlBase, controlSurface[surface], "h-[40px] px-2", className)} {...rest} />;
}
