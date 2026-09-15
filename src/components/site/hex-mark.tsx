import { cx } from "@/lib/cx";

type HexMarkProps = {
  className?: string;
  /** Aperture colour. Set to the page surface so the mark reads as a cut-out at large scale. */
  aperture?: "white" | "bone" | "paper";
  /**
   * "full" is the signature gradient mark on a solid aperture plate, for bone,
   * paper or olive-950 at 24px and up. "simple" is the single-colour hex the
   * brand guide calls for at the small end: one currentColor shape with the
   * aperture knocked through, so the ground shows and the mark can invert with
   * the surface instead of dropping a white plate on it.
   */
  variant?: "full" | "simple";
  /** Decorative by default. Give a title only when the mark carries meaning. */
  title?: string;
};

const apertureFill = { white: "#FFFFFF", bone: "var(--color-bone)", paper: "var(--color-paper)" };

/**
 * The hex mark as vector: rounded hexagon holding a four-point spark in a
 * circular aperture. Gradient is the fixed 135° signature: lime, olive-400
 * at 46%, olive-950. Rebuilt from the supplied icon so it holds at 640px.
 */
const HEX = "50,8 86,29 86,71 50,92 14,71 14,29";
/** The four-point spark. The small form is tightened so it stays open at 24px. */
const SPARK = "M50 31 C52.2 43.5 56.5 47.8 69 50 C56.5 52.2 52.2 56.5 50 69 C47.8 56.5 43.5 52.2 31 50 C43.5 47.8 47.8 43.5 50 31 Z";
const SPARK_SMALL = "M50 35 C51.7 44.4 55 47.6 64.4 50 C55 52.4 51.7 55.6 50 65 C48.3 55.6 45 52.4 35.6 50 C45 47.6 48.3 44.4 50 35 Z";

export function HexMark({ className, aperture = "white", variant = "full", title }: HexMarkProps) {
  const id = `hexgrad-${aperture}`;
  if (variant === "simple") {
    return (
      <svg
        viewBox="0 0 100 100"
        width="100"
        height="100"
        className={cx("block", className)}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : "true"}
        focusable="false"
      >
        {title ? <title>{title}</title> : null}
        <defs>
          {/* White shows the shape, black cuts it away: the aperture is a hole
              and the spark is left standing inside it. */}
          <mask id="hexmark-simple">
            <rect width="100" height="100" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="23.5" fill="#000000" />
            <path d={SPARK_SMALL} fill="#FFFFFF" />
          </mask>
        </defs>
        <polygon points={HEX} fill="currentColor" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" mask="url(#hexmark-simple)" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width="100"
      height="100"
      className={cx("block", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D6F631" />
          <stop offset="0.46" stopColor="#8EA320" />
          <stop offset="1" stopColor="#171B06" />
        </linearGradient>
      </defs>
      {/* Thick round-joined stroke on the same gradient gives the rounded corners. */}
      <polygon
        points={HEX}
        fill={`url(#${id})`}
        stroke={`url(#${id})`}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="23.5" fill={apertureFill[aperture]} />
      <path d={SPARK} fill="#D6F631" />
    </svg>
  );
}
