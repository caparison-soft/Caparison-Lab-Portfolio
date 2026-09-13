import { Button } from "@/components/ui";
import { HeroGlass, HeroStill } from "@/components/site/hero-glass";
import { HeroWeave } from "@/components/site/hero-weave";
import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";

type HeroProps = { blocks: Blocks; settings?: Settings };

/**
 * The hero: three-line headline, sub and one CTA, set low under the fixed
 * header (owner's call, 2026-09-13) with the glass logo to the right at lg+.
 * The former live strip ("currently building") was removed at the same time.
 */
export function Hero({ blocks }: HeroProps) {
  const headline = lines(t(blocks, "home.hero.headline")).slice(0, 3);

  return (
    <section className="hero section-dark ground-ink on-dark relative overflow-x-clip px-3 md:px-[48px] pt-5 lg:pt-7 pb-6 lg:pb-7">
      {/* The ground: a woven thread field that answers the pointer, with grain on top. */}
      <HeroWeave />
      {/* Phones: the still in the top-right corner. Desktops get the live glass over the headline. */}
      <HeroStill desktopFallback={false} />

      <div className="relative z-10 max-w-layout mx-auto pt-[140px] md:pt-[160px] lg:pt-[48px]">
        <div className="min-w-0">
          {/* lg+: the glass logo over the headline with real refraction. The
              headline and sub are painted into the glass scene at their DOM
              positions; the DOM copies go transparent once the glass is ready. */}
          <div className="relative hero-block">
          <HeroGlass />
          <h1 className="text-bone">
            {headline.map((line, i) => (
              <span key={i} data-glass-text className="block reveal" style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
                {line}
              </span>
            ))}
          </h1>
          <p data-glass-text className="reveal-quick mt-4 text-body-l text-sage max-w-[52ch]" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            {t(blocks, "home.hero.sub")}
          </p>
          </div>
          <div className="reveal-quick mt-4 flex flex-wrap items-center gap-2" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <Button href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
          </div>

        </div>
      </div>
    </section>
  );
}
