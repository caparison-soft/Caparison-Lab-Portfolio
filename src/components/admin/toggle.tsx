"use client";
// Client component: a switch with an optimistic value and rollback.

import { useState, useTransition } from "react";
import { cx } from "@/lib/cx";

type ToggleProps = {
  checked: boolean;
  label: string;
  /** Return false or throw to roll back. */
  onChange?: (next: boolean) => Promise<boolean | void> | boolean | void;
  disabled?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function Toggle({ checked, label, onChange, disabled, showLabel = true, size = "md" }: ToggleProps) {
  const [value, setValue] = useState(checked);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const w = size === "sm" ? "w-[28px] h-[16px]" : "w-[36px] h-[20px]";
  const knob = size === "sm" ? "w-[12px] h-[12px]" : "w-[16px] h-[16px]";
  const shift = size === "sm" ? "translate-x-[12px]" : "translate-x-[16px]";

  function toggle() {
    const next = !value;
    setValue(next);
    setError(null);
    if (!onChange) return;
    start(async () => {
      try {
        const ok = await onChange(next);
        if (ok === false) { setValue(!next); setError("Not saved."); }
      } catch (e) {
        setValue(!next);
        setError(e instanceof Error ? e.message : "Not saved.");
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={showLabel ? undefined : label}
        disabled={disabled || pending}
        onClick={toggle}
        className={cx("relative inline-flex items-center rounded-full border transition-colors dur-fast disabled:opacity-50", w, value ? "bg-lime border-lime" : "bg-paper border-ash")}
      >
        <span className={cx("absolute left-[1px] rounded-full transition-transform dur-fast", knob, value ? cx("bg-ink", shift) : "bg-ash translate-x-0")} />
      </button>
      {showLabel ? <span className="text-small text-ink">{label}</span> : null}
      {error ? <span role="alert" className="text-small text-status-error">{error}</span> : null}
    </span>
  );
}
