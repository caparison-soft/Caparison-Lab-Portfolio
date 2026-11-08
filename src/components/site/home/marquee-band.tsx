import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { HexMark } from "@/components/site/hex-mark";

/**
 * A tilted olive band of the services, two rows running opposite ways and
 * speeding up with the scroll. Decorative: the same services are listed in
 * full further down, so the band is hidden from screen readers.
 */
export function MarqueeBand({ words }: { words: string[] }) {
  const row = (outline: boolean) =>
    words.map((w) => (
      <span key={w} className="inline-flex items-center">
        <span className={outline ? "marquee-word marquee-word-outline" : "marquee-word"}>{w}</span>
        <HexMark variant="simple" className="marquee-hex text-lime" />
      </span>
    ));
  return (
    <div className="marquee-band" aria-hidden="true">
      <div className="marquee-tilt section-dark on-dark">
        <VelocityMarquee speed={3}>{row(false)}</VelocityMarquee>
        <VelocityMarquee speed={-2.2} className="mt-[-4px]">{row(true)}</VelocityMarquee>
      </div>
    </div>
  );
}
