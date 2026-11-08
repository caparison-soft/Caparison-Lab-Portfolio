import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { InfiniteSlider } from "@/components/site/infinite-slider";

/**
 * Home on black: a strip of brands the studio has made videos for (owner,
 * 2026-11-07, after two references: a dark row of faded logos, and a card of
 * client logos). It drifts on its own, slows under the pointer and can be
 * dragged (InfiniteSlider). The logos were drawn for light grounds, so at rest
 * they show as quiet bone silhouettes; hovering one lifts it onto a paper tile
 * in its own colours. Static under reduced motion. Server component.
 */
export function LogoStrip({ blocks }: { blocks: Blocks }) {
  const logos = lines(t(blocks, "home.logos.items"))
    .map((l) => {
      const [name = "", file = ""] = l.split("|").map((s) => s.trim());
      return { name, file };
    })
    .filter((l) => l.name && /^[a-z0-9-]+$/.test(l.file));
  if (logos.length === 0) return null;
  return (
    <section className="ls" aria-labelledby="ls-label">
      <p id="ls-label" className="ls-label" data-reveal="up">{t(blocks, "home.logos.label")}</p>
      <div className="ls-row" data-reveal="fade">
        <InfiniteSlider gap={20} duration={42} durationOnHover={140}>
          {logos.map((l) => (
            <span key={l.file} className="ls-tile" role="img" aria-label={l.name}>
              <img src={`/brand/clients/${l.file}.webp`} alt="" draggable={false} loading="lazy" />
            </span>
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
