import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type CtaButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "lime" | "ink" | "ghost";
  size?: "md" | "sm";
  /** The arrow puck at the right end. Off for plain buttons. */
  arrow?: boolean;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  pending?: boolean;
  /** Opens in a new tab (external links). */
  external?: boolean;
  "data-chat-open"?: boolean;
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The public site's button (src/styles/site.css, "Buttons"). Lime with ink is
 * the main action; an ink sheet rises on hover and the label turns lime. Ink
 * and ghost are the quieter variants. Link when href is set, otherwise a
 * <button>. Server component.
 */
export function CtaButton({ children, href, variant = "lime", size = "md", arrow = true, className, type = "button", onClick, pending, external, ...rest }: CtaButtonProps) {
  const cls = cx("cl-btn", variant === "ink" && "cl-btn--ink", variant === "ghost" && "cl-btn--ghost", size === "sm" && "cl-btn--sm", !arrow && "cl-btn--plain", className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <span className="cl-btn-puck" aria-hidden="true">
          <Arrow />
          <Arrow />
        </span>
      ) : null}
    </>
  );
  if (href) {
    return external ? (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{inner}</a>
    ) : (
      <Link href={href} className={cls}>{inner}</Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} aria-busy={pending || undefined} disabled={pending} data-chat-open={rest["data-chat-open"] || undefined}>
      {inner}
    </button>
  );
}
