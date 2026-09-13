import { Button, SectionMarker, TagList } from "@/components/ui";
import { HeroGlass, HeroStill } from "@/components/site/hero-glass";
import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import type { LiveProject } from "@/lib/queries/home";

type HeroProps = { blocks: Blocks; settings?: Settings; live: LiveProject | null };

/**
 * The hero. Rail: availability and the section index. Column: three-line
 * headline, sub, two CTAs, then the live strip as a hairline-topped bar that
 * hands off into the dark work section beneath. The hex mark bleeds off the
 * right edge in its own space; nothing sits under it.
 */
export function Hero({ blocks, live }: HeroProps) {
  const headline = lines(t(blocks, "home.hero.headline")).slice(0, 3);

  return (
    <section className="hero section-dark on-dark relative overflow-x-clip px-3 md:px-[48px] pt-5 lg:pt-6">
      {/* Phones: the still in the top-right corner. Desktops get the live glass over the headline. */}
      <HeroStill desktopFallback={false} />

      <div className="max-w-layout mx-auto pt-[120px] md:pt-[140px] lg:pt-0">
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

          <div className="reveal-quick mt-5 lg:mt-6 border-t border-olive-600 pt-2 pb-4" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <SectionMarker as="p" surface="dark">{t(blocks, "home.live.label")}</SectionMarker>
            {live ? (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-[auto_auto_minmax(0,1fr)] gap-x-4 gap-y-1 items-center">
                <p className="data text-bone max-w-none">{live.slug}</p>
                <TagList items={live.stack} surface="dark" />
                <p className="data text-sage max-w-none md:text-right">{live.buildNote ?? ""}</p>
              </div>
            ) : (
              <p className="mt-2 data text-sage max-w-none">{t(blocks, "home.live.empty")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
