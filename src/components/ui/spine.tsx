import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type SpineProps = {
  /** The rail: marker, status, index, metadata. */
  rail: ReactNode;
  /** Rail stays in view while the content scrolls. */
  sticky?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * The spine: the rail (marker, index, metadata) sits above the content as a
 * heading row, and the content takes the full container width. It used to
 * be a 180px left column; the owner found the empty left margin wasteful
 * (2026-09-14), so every section now reads top-down and centred in the
 * 1240px container. `sticky` is kept for callers but no longer pins anything.
 */
export function Spine({ rail, className, children }: SpineProps) {
  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="min-w-0 spine-rail">{rail}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export type SpineIndexItem = { href: string; label: string; active?: boolean };

/**
 * The section index inside a rail. The active item carries the 2px lime
 * cursor on its left edge.
 */
export function SpineIndex({ items, surface = "light", className }: { items: SpineIndexItem[]; surface?: Surface; className?: string }) {
  const idle = surface === "dark" ? "text-sage hover:text-bone" : "text-ash hover:text-ink";
  const active = surface === "dark" ? "text-bone" : "text-ink";
  return (
    <nav aria-label="Sections" className={className}>
      <ul className="list-none m-0 p-0 flex flex-row flex-wrap gap-x-2">
        {items.map((item) => (
          <li key={item.href} className={cx(item.active && "is-active")}>
            <Link
              href={item.href}
              aria-current={item.active ? "location" : undefined}
              className={cx("block py-[4px] pl-1 text-small font-medium no-underline transition-colors dur-fast", item.active ? active : idle)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
