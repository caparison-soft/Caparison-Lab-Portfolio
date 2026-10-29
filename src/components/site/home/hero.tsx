import { Button } from "@/components/ui";
import { HeroWeave } from "@/components/site/hero-weave";
import { HeroWork, type HeroWorkItem } from "@/components/site/home/hero-work";
import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import type { HeroProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";

type HeroProps = { blocks: Blocks; settings?: Settings; work?: HeroProject[] };

/**
 * The hero: full viewport height, content centred vertically (owner's call,
 * 2026-09-13). Two columns at lg+: the headline, sub and one CTA on the left,
 * a rotating case card on the right.
 *
 * The 3D glass logo that used to sit on the right is gone (owner, 2026-10-29:
 * it meant nothing, and the page needs to show the work). With it went the
 * headline's refraction - three.js can only refract what it draws, so the
 * headline used to be painted into the glass scene and the DOM copy hidden.
 * The headline is now just the headline.
 */
export function Hero({ blocks, work = [] }: HeroProps) {
  const headline = lines(t(blocks, "home.hero.headline")).slice(0, 3);
  const items: HeroWorkItem[] = work.map((p) => {
    const { src, srcSet } = imageSrcSet(p.cover.keyPrefix, p.cover.variants);
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      metric: p.metric,
      cover: { src, srcSet, alt: p.cover.alt ?? p.summary, blurDataUrl: p.cover.blurDataUrl },
    };
  });

  return (
    <section className="hero section-dark ground-ink on-dark relative overflow-x-clip px-3 md:px-[48px] min-h-[100svh] flex flex-col justify-center pt-[96px] pb-5">
      {/* The ground: a woven thread field that answers the pointer, with grain on top. */}
      <HeroWeave />

      <div className="relative z-10 w-full max-w-layout mx-auto pt-[64px] lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)] gap-5 lg:gap-6 items-center">
          <div className="min-w-0">
            <h1 className="text-bone lg:text-display-hero">
              {headline.map((line, i) => (
                <span key={i} className="block reveal" style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="reveal-quick mt-3 text-body-l text-sage max-w-[40ch]" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
              {t(blocks, "home.hero.sub")}
            </p>
            <div className="reveal-quick mt-4 flex flex-wrap items-center gap-2" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
              <Button href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="reveal-quick min-w-0 lg:justify-self-end w-full" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
              <HeroWork items={items} viewLabel={t(blocks, "home.hero.workLabel")} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
