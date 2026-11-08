import { vars } from "@/components/motion/split";
import { cx } from "@/lib/cx";

/**
 * A small drawing for each service group, used when the capability has no
 * image. Inline SVG with token colours only (classes in src/styles/services.css).
 * Strokes draw in and fills pop when the RevealObserver marks the wrapper as in
 * view; after that a few parts keep moving (a ping, dashes along a path, a
 * playhead). Without JS or with reduced motion it is a still drawing.
 * Decorative: the text beside it says the same thing.
 */
export function ServiceMotif({ slug, className }: { slug: string; className?: string }) {
  return (
    <div className={cx("sv-motif", className)} data-reveal="fade" aria-hidden="true">
      <svg viewBox="0 0 320 200" fill="none" focusable="false">
        {slug === "digital-presence" ? <Presence /> : slug === "business-automation" ? <Automation /> : slug === "content-and-branding" ? <Content /> : slug === "marketing-and-growth" ? <Growth /> : <Hex />}
      </svg>
    </div>
  );
}

/** A browser window with a page in it and a map pin beside the page. */
function Presence() {
  return (
    <>
      <rect className="sv-draw s-ink f-paper" pathLength={1} x="20" y="20" width="280" height="160" rx="10" />
      <path className="sv-draw s-ink" pathLength={1} d="M20 46H300" style={vars({ "--i": 1 })} />
      <circle className="sv-pop f-olive" cx="36" cy="33" r="3.5" style={vars({ "--i": 2 })} />
      <circle className="sv-pop f-olive" cx="48" cy="33" r="3.5" style={vars({ "--i": 3 })} />
      <circle className="sv-pop f-olive" cx="60" cy="33" r="3.5" style={vars({ "--i": 4 })} />
      <rect className="sv-pop f-bone" x="84" y="28" width="150" height="10" rx="5" style={vars({ "--i": 3 })} />
      <rect className="sv-pop f-ink" x="40" y="66" width="118" height="12" rx="3" style={vars({ "--i": 4 })} />
      <rect className="sv-pop f-ink" x="40" y="84" width="86" height="12" rx="3" style={vars({ "--i": 5 })} />
      <rect className="sv-pop f-ash" x="40" y="108" width="124" height="4" rx="2" style={vars({ "--i": 6 })} />
      <rect className="sv-pop f-ash" x="40" y="118" width="100" height="4" rx="2" style={vars({ "--i": 6 })} />
      <rect className="sv-pop sv-cta s-ink f-lime" x="40" y="136" width="70" height="24" rx="12" style={vars({ "--i": 7 })} />
      <rect className="sv-draw s-hair f-bone" pathLength={1} x="186" y="62" width="96" height="100" rx="6" style={vars({ "--i": 2 })} />
      <path className="sv-draw s-hair" pathLength={1} d="M186 96H282M186 128H282M218 62V162M250 62V162" style={vars({ "--i": 3 })} />
      <path className="sv-draw s-road" pathLength={1} d="M192 150C214 140 214 112 234 108" style={vars({ "--i": 4 })} />
      <ellipse className="sv-ping s-ink" cx="234" cy="124" rx="14" ry="5" />
      <path className="sv-pop sv-pin s-ink f-lime" d="M234 124c0 0-15-15-15-26a15 15 0 1 1 30 0c0 11-15 26-15 26z" style={vars({ "--i": 8 })} />
      <circle className="sv-pop f-ink" cx="234" cy="98" r="5" style={vars({ "--i": 9 })} />
    </>
  );
}

/** A request, a text and a booking, joined by paths with work moving along them. */
function Automation() {
  return (
    <>
      <circle className="sv-draw s-ink f-paper" pathLength={1} cx="54" cy="150" r="22" />
      <path className="sv-hand s-ink" d="M54 150V136" />
      <path className="sv-draw s-ink" pathLength={1} d="M54 150l9 6" style={vars({ "--i": 1 })} />
      <rect className="sv-draw s-ink f-paper" pathLength={1} x="20" y="34" width="80" height="50" rx="8" style={vars({ "--i": 1 })} />
      <rect className="sv-pop f-ink" x="32" y="48" width="44" height="6" rx="3" style={vars({ "--i": 2 })} />
      <rect className="sv-pop f-ash" x="32" y="60" width="56" height="4" rx="2" style={vars({ "--i": 3 })} />
      <rect className="sv-pop f-ash" x="32" y="69" width="36" height="4" rx="2" style={vars({ "--i": 3 })} />
      <path className="sv-draw s-ink" pathLength={1} d="M100 59C126 59 100 139 126 139" style={vars({ "--i": 3 })} />
      <path className="sv-flow s-olive" d="M100 59C126 59 100 139 126 139" />
      <rect className="sv-draw s-ink f-paper" pathLength={1} x="126" y="114" width="80" height="50" rx="8" style={vars({ "--i": 4 })} />
      <path className="sv-pop s-ink f-bone" d="M140 128h52a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-40l-8 7v-7h-4a6 6 0 0 1-6-6v-10a6 6 0 0 1 6-6z" style={vars({ "--i": 5 })} />
      <path className="sv-draw s-ink" pathLength={1} d="M206 139C232 139 206 59 232 59" style={vars({ "--i": 6 })} />
      <path className="sv-flow s-olive" d="M206 139C232 139 206 59 232 59" />
      <rect className="sv-pop sv-booked s-ink f-lime" x="232" y="34" width="68" height="50" rx="8" style={vars({ "--i": 7 })} />
      <path className="sv-draw s-ink-thick" pathLength={1} d="M252 59l9 9 18-18" style={vars({ "--i": 9 })} />
    </>
  );
}

/** A video frame with a lime play mark, an edit timeline with a moving playhead, photos to the side. */
function Content() {
  return (
    <>
      <rect className="sv-draw s-ink f-dark" pathLength={1} x="20" y="20" width="184" height="116" rx="8" />
      <path className="sv-pop f-lime" d="M100 58l34 20-34 20z" style={vars({ "--i": 3 })} />
      <rect className="sv-draw s-ink f-paper" pathLength={1} x="20" y="148" width="184" height="30" rx="4" style={vars({ "--i": 1 })} />
      <rect className="sv-pop f-olive" x="26" y="154" width="46" height="18" rx="2" style={vars({ "--i": 2 })} />
      <rect className="sv-pop f-bone s-hair" x="76" y="154" width="64" height="18" rx="2" style={vars({ "--i": 3 })} />
      <rect className="sv-pop f-lime s-ink" x="144" y="154" width="54" height="18" rx="2" style={vars({ "--i": 4 })} />
      <path className="sv-playhead s-ink-thick" d="M32 144V182" />
      <g className="sv-tilt">
        <rect className="sv-draw s-ink f-paper" pathLength={1} x="222" y="24" width="78" height="62" rx="6" style={vars({ "--i": 2 })} />
        <path className="sv-draw s-ink" pathLength={1} d="M230 76l16-18 12 12 8-8 16 14" style={vars({ "--i": 4 })} />
        <circle className="sv-pop f-lime s-ink" cx="282" cy="40" r="6" style={vars({ "--i": 5 })} />
      </g>
      <rect className="sv-draw s-ink f-bone" pathLength={1} x="222" y="98" width="78" height="80" rx="6" style={vars({ "--i": 3 })} />
      <rect className="sv-pop f-ink" x="232" y="110" width="40" height="6" rx="3" style={vars({ "--i": 5 })} />
      <rect className="sv-pop f-ash" x="232" y="122" width="56" height="4" rx="2" style={vars({ "--i": 6 })} />
      <rect className="sv-pop f-ash" x="232" y="131" width="48" height="4" rx="2" style={vars({ "--i": 6 })} />
      <rect className="sv-pop f-olive" x="232" y="146" width="56" height="22" rx="4" style={vars({ "--i": 7 })} />
    </>
  );
}

/** Bars that rise, a line that draws over them, and a lime point at the end. */
function Growth() {
  const bars = [
    { x: 52, h: 30 },
    { x: 100, h: 50 },
    { x: 148, h: 66 },
    { x: 196, h: 92 },
    { x: 244, h: 120 },
  ];
  return (
    <>
      <path className="sv-draw s-hair" pathLength={1} d="M28 62H300M28 102H300M28 142H300" />
      {bars.map((b, i) => (
        <rect key={b.x} className={cx("sv-grow s-ink", i === bars.length - 1 ? "f-lime" : "f-bone")} x={b.x} y={170 - b.h} width="30" height={b.h} rx="3" style={vars({ "--i": i + 1 })} />
      ))}
      <path className="sv-draw s-ink" pathLength={1} d="M28 22V170H300" />
      <path className="sv-draw s-ink-thick" pathLength={1} d="M67 128L115 108 163 92 211 64 259 36" style={vars({ "--i": 5 })} />
      <circle className="sv-ping-ring s-ink" cx="259" cy="36" r="7" />
      <circle className="sv-pop f-lime s-ink" cx="259" cy="36" r="7" style={vars({ "--i": 8 })} />
    </>
  );
}

function Hex() {
  return (
    <>
      <path className="sv-draw s-ink f-paper" pathLength={1} d="M160 24l64 37v78l-64 37-64-37V61z" />
      <path className="sv-pop f-lime s-ink" d="M160 70l24 14v28l-24 14-24-14V84z" style={vars({ "--i": 4 })} />
    </>
  );
}
