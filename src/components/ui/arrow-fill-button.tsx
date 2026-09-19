// Owner-supplied arrow-fill button (2026-09-19), rebuilt to the site's rules:
// the pasted version sized everything in vw, hardcoded hex colours and pulled
// the arrow from lucide. Here it is one pill at the site's 44px, colours and
// motion from the tokens, an inline SVG arrow, and no JavaScript at all - the
// whole thing is :hover / :focus-visible / :active, so it can render on the
// server. Styles live in globals.css under "Arrow fill button".
//
// At rest a lime puck sits at the right end of an outlined pill. Hovering
// sweeps the puck out into the whole pill, the label crossfades to ink as the
// fill passes under it, and the arrow flies out to the right while a second
// one flies in from the left.

import { cx } from "@/lib/cx";

type Props = {
  label: string;
  href: string;
  /** Opens in a new tab with the usual rel, for links off the site. */
  external?: boolean;
  className?: string;
};

function Arrow({ className }: { className: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowFillButton({ label, href, external = false, className }: Props) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      className={cx("arrow-fill", className)}
    >
      <span className="arrow-fill-label">{label}</span>
      {/* The sweeping fill, and the same label clipped to it so the words turn
          ink exactly as the lime passes under them. */}
      <span aria-hidden="true" className="arrow-fill-sheet" />
      <span aria-hidden="true" className="arrow-fill-clip">
        <span>{label}</span>
      </span>
      <span aria-hidden="true" className="arrow-fill-puck">
        <Arrow className="arrow-fill-arrow arrow-fill-arrow-in" />
        <Arrow className="arrow-fill-arrow arrow-fill-arrow-out" />
      </span>
    </a>
  );
}

export default ArrowFillButton;
