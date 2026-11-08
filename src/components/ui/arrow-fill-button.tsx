// Owner-supplied arrow-fill button (first 2026-09-19, again 2026-11-07),
// rebuilt to the site's rules: the pasted version sized everything in vw,
// hardcoded hex colours and pulled the arrow from lucide. Here the sizes and
// colours come from the tokens, the arrow is an inline SVG, and there is no
// JavaScript at all: the whole thing is :hover / :focus-visible / :active, so
// it renders on the server. Styles live in src/styles/site.css under
// "Arrow fill button".
//
// At rest a puck with an arrow sits at the right end of the pill. Hovering
// sweeps the puck out over the whole pill; the label changes colour exactly as
// the fill passes under it (a clipped copy of the label rides on the fill), one
// arrow flies out to the right and another flies in from the left.
//
// Owner, 2026-11-07: only the main actions use it ("Free website review",
// "Explore our services"); quieter links stay plain.

import Link from "next/link";
import { cx } from "@/lib/cx";

type Props = {
  label: string;
  /** A link when set, otherwise a <button type="button">. */
  href?: string;
  /** Opens in a new tab with the usual rel, for links off the site. */
  external?: boolean;
  /** "leaf" on black or Emerald grounds; "emerald" on light ones (Leaf never sits on light). */
  tone?: "leaf" | "emerald";
  size?: "md" | "sm";
  className?: string;
  /** Opens the site assistant instead of navigating (read by the chat widget). */
  "data-chat-open"?: boolean;
};

function Arrow({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowFillButton({ label, href, external = false, tone = "leaf", size = "md", className, ...rest }: Props) {
  const cls = cx("arrow-fill", tone === "emerald" && "arrow-fill--emerald", size === "sm" && "arrow-fill--sm", className);
  const inner = (
    <>
      <span className="arrow-fill-label">{label}</span>
      <span aria-hidden="true" className="arrow-fill-fill" />
      <span aria-hidden="true" className="arrow-fill-copy">{label}</span>
      <span aria-hidden="true" className="arrow-fill-puck">
        <Arrow className="arrow-fill-arrow arrow-fill-arrow-in" />
        <Arrow className="arrow-fill-arrow arrow-fill-arrow-out" />
      </span>
    </>
  );
  if (!href) {
    return (
      <button type="button" className={cls} {...rest}>
        {inner}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}

export default ArrowFillButton;
