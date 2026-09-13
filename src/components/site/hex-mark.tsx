import { cx } from "@/lib/cx";

type HexMarkProps = {
  className?: string;
  /** Aperture colour. Set to the page surface so the mark reads as a cut-out at large scale. */
  aperture?: "white" | "bone" | "paper";
  /** Decorative by default. Give a title only when the mark carries meaning. */
  title?: string;
};

const apertureFill = { white: "#FFFFFF", bone: "var(--color-bone)", paper: "var(--color-paper)" };

/**
 * The hex mark as vector: rounded hexagon holding a four-point spark in a
 * circular aperture. Gradient is the fixed 135° signature: lime, olive-400
 * at 46%, olive-950. Rebuilt from the supplied icon so it holds at 640px.
 */
export function HexMark({ className, aperture = "white", title }: HexMarkProps) {
  const id = `hexgrad-${aperture}`;
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
        points="50,8 86,29 86,71 50,92 14,71 14,29"
        fill={`url(#${id})`}
        stroke={`url(#${id})`}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="23.5" fill={apertureFill[aperture]} />
      <path
        d="M50 31 C52.2 43.5 56.5 47.8 69 50 C56.5 52.2 52.2 56.5 50 69 C47.8 56.5 43.5 52.2 31 50 C43.5 47.8 47.8 43.5 50 31 Z"
        fill="#D6F631"
      />
    </svg>
  );
}
