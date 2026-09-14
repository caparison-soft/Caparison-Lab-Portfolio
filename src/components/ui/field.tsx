import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type FieldProps = {
  /** Required so the label is wired without client hooks. */
  id: string;
  label: string;
  help?: React.ReactNode;
  error?: string;
  surface?: Surface;
  className?: string;
  /** Exactly one Input, Select or Textarea. */
  children: ReactNode;
};

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Label + control + help/error, wired with id and aria-describedby.
 * Labels are labels. Placeholders are never labels.
 */
export function Field({ id, label, help, error, surface = "light", className, children }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const child = Children.only(children);
  const control = isValidElement<ControlProps>(child)
    ? cloneElement(child as ReactElement<ControlProps>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : child;

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={id} className={cx("text-small", surface === "dark" ? "text-sage" : "text-ash")}>
        {label}
      </label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className={cx("text-small max-w-none", surface === "dark" ? "text-status-warn" : "text-status-error")}>
          {error}
        </p>
      ) : null}
      {help && !error ? (
        <p id={helpId} className={cx("text-small max-w-none", surface === "dark" ? "text-sage" : "text-ash")}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
