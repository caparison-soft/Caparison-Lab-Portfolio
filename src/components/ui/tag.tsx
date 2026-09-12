import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type TagProps = {
  /** data = mono, for stack names and other machine values. filter = pill, for the /work filters. */
  variant?: "data" | "filter";
  surface?: Surface;
  /** Filter pills only: the current selection. */
  selected?: boolean;
  href?: string;
  className?: string;
  children: ReactNode;
};

const data: Record<Surface, string> = {
  light: "data h-[24px] px-1 rounded-sm bg-paper text-ink border border-divider-light",
  dark: "data h-[24px] px-1 rounded-sm bg-olive-800 text-sage border border-olive-600",
};

const filter: Record<Surface, { base: string; selected: string; idle: string }> = {
  light: {
    base: "h-[32px] px-2 rounded-full text-small font-medium border transition-colors dur-fast ease-out",
    selected: "bg-lime text-ink border-lime",
    idle: "bg-transparent text-ink border-divider-light hover:border-ink",
  },
  dark: {
    base: "on-dark h-[32px] px-2 rounded-full text-small font-medium border transition-colors dur-fast ease-out",
    selected: "bg-lime text-ink border-lime",
    idle: "bg-transparent text-bone border-olive-600 hover:border-lime",
  },
};

export function Tag({ variant = "data", surface = "light", selected = false, href, className, children }: TagProps) {
  const classes = cx(
    "inline-flex items-center whitespace-nowrap no-underline",
    variant === "data" ? data[surface] : cx(filter[surface].base, selected ? filter[surface].selected : filter[surface].idle),
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes} aria-current={selected ? "true" : undefined}>
        {children}
      </Link>
    );
  }
  return <span className={classes}>{children}</span>;
}

/** A row of data tags with no separator glyph between them. */
export function TagList({ items, surface = "light", className }: { items: string[]; surface?: Surface; className?: string }) {
  return (
    <ul className={cx("flex flex-wrap gap-1 list-none p-0 m-0", className)}>
      {items.map((item) => (
        <li key={item}>
          <Tag surface={surface}>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
