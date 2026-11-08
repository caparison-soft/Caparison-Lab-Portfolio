import Link from "next/link";
import { cx } from "@/lib/cx";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** A plain <a> (mailto: links always are). */
  external?: boolean;
  /** The trailing arrow; off for links inside a sentence. */
  arrow?: boolean;
};

/** The quiet text link on black: bone label, a Leaf underline that draws on hover, a small arrow that nudges. */
export function HbLink({ href, children, className, external = false, arrow = true }: Props) {
  const inner = (
    <>
      <span className="hb-link-label">{children}</span>
      {arrow ? (
        <svg className="hb-link-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </>
  );
  if (external || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cx("hb-link", className)}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cx("hb-link", className)}>
      {inner}
    </Link>
  );
}

export default HbLink;
