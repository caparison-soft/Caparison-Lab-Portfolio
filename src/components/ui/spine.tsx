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
 * The spine: a 180px orientation rail on the left, content on the right,
 * left-aligned. Below 1024px the rail becomes a block above the content.
 */
export function Spine({ rail, sticky = true, className, children }: SpineProps) {
  return (
    <div className={cx("grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5", className)}>
      <aside className={cx("min-w-0", sticky && "lg:sticky lg:top-3 lg:self-start")}>{rail}</aside>
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
      <ul className="list-none m-0 p-0 flex flex-row flex-wrap gap-x-2 lg:flex-col lg:gap-x-0">
        {items.map((item) => (
          <li key={item.href} className={cx(item.active && "is-active")}>
            <Link
              href={item.href}
              aria-current={item.active ? "location" : undefined}
              className={cx("block py-[4px] pl-1 lg:pl-2 text-small font-medium no-underline transition-colors dur-fast", item.active ? active : idle)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
