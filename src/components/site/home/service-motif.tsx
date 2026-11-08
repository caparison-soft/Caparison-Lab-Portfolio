import { cx } from "@/lib/cx";

/**
 * A line drawing per service group, in olive-600 strokes with one lime part.
 * The strokes draw themselves when the parent card is revealed
 * (.motif path in home.css). Unknown slugs fall back to the hexagon.
 */
export function ServiceMotif({ slug, className }: { slug: string; className?: string }) {
  const common = { fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1 };
  let body: React.ReactNode;
  switch (slug) {
    case "digital-presence":
      body = (
        <>
          <rect x="20" y="24" width="160" height="104" rx="8" stroke="currentColor" {...common} />
          <path d="M20 44h160M32 34h4M42 34h4M52 34h4" stroke="currentColor" {...common} />
          <path d="M36 62h60M36 74h44" stroke="currentColor" {...common} />
          <rect x="36" y="88" width="52" height="18" rx="9" className="motif-lime" {...common} />
          <rect x="112" y="58" width="52" height="56" rx="6" stroke="currentColor" {...common} />
          <rect x="140" y="80" width="40" height="64" rx="7" stroke="currentColor" {...common} />
        </>
      );
      break;
    case "business-automation":
      body = (
        <>
          <circle cx="40" cy="76" r="16" stroke="currentColor" {...common} />
          <circle cx="160" cy="40" r="14" stroke="currentColor" {...common} />
          <circle cx="160" cy="112" r="14" stroke="currentColor" {...common} />
          <rect x="84" y="60" width="36" height="32" rx="6" className="motif-lime" {...common} />
          <path d="M56 76h28M120 70c18 0 14-30 26-30M120 82c18 0 14 30 26 30" stroke="currentColor" {...common} />
          <path d="m35 76 4 4 7-8" stroke="currentColor" {...common} />
        </>
      );
      break;
    case "content-and-branding":
      body = (
        <>
          <rect x="24" y="36" width="112" height="80" rx="8" stroke="currentColor" {...common} />
          <path d="M136 62l40-20v68l-40-20" stroke="currentColor" {...common} />
          <path d="M70 60v32l26-16-26-16Z" className="motif-lime" {...common} />
          <path d="M24 130h40M74 130h20" stroke="currentColor" {...common} />
        </>
      );
      break;
    case "marketing-and-growth":
      body = (
        <>
          <path d="M24 132h156M24 132V28" stroke="currentColor" {...common} />
          <path d="M36 118l30-24 26 14 34-38 22 12 26-34" className="motif-lime" {...common} />
          <path d="M156 48h18v18" stroke="currentColor" {...common} />
          <path d="M48 132v-10M80 132v-18M112 132v-26M144 132v-40" stroke="currentColor" {...common} />
        </>
      );
      break;
    default:
      body = <path d="M100 20l52 30v60l-52 30-52-30V50z" stroke="currentColor" {...common} />;
  }
  return (
    <svg viewBox="0 0 200 152" aria-hidden="true" className={cx("motif", className)}>
      {body}
    </svg>
  );
}
