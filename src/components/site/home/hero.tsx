import { Button, SectionMarker, SpineIndex, StatusDot, TagList } from "@/components/ui";
import { HeroMark3D } from "@/components/site/hero-mark-3d";
import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import type { LiveProject } from "@/lib/queries/home";

type HeroProps = { blocks: Blocks; settings: Settings; live: LiveProject | null };

const availabilityStatus = { AVAILABLE: "live", LIMITED: "progress", BOOKED: "draft" } as const;

/**
 * The hero. Rail: availability and the section index. Column: three-line
 * headline, sub, two CTAs, then the live strip as a hairline-topped bar that
 * hands off into the dark work section beneath. The hex mark bleeds off the
 * right edge in its own space; nothing sits under it.
 */
export function Hero({ blocks, settings, live }: HeroProps) {
  const headline = lines(t(blocks, "home.hero.headline")).slice(0, 3);
  const indexItems = [
    { href: "#work", label: t(blocks, "home.work.marker"), active: true },
    { href: "#capabilities", label: t(blocks, "home.capabilities.marker") },
    { href: "#process", label: t(blocks, "home.process.marker") },
    { href: "#contact", label: t(blocks, "home.contact.marker") },
  ];

  return (
    <section className="relative overflow-x-clip bg-bone px-3 md:px-[48px] pt-4 lg:pt-6">
      {/* The 3D glass logo, in its own space, clipped by the viewport on purpose.
          Explicit square size: the canvas fills its parent. Nothing sits under it. */}
      <div
        className="reveal-mark absolute top-0 right-[-72px] w-[200px] md:w-[240px] md:right-[-96px] lg:w-[260px] lg:right-[-160px] xl:top-[24px] xl:w-[560px] xl:right-auto xl:left-[max(50vw+470px,100vw-380px)]"
      >
        <HeroMark3D className="w-full" />
      </div>

      <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
        <aside className="reveal-quick pt-[120px] md:pt-[140px] lg:pt-[8px] lg:sticky lg:top-3 lg:self-start" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
          <div className="flex flex-col gap-3">
            <StatusDot status={availabilityStatus[settings.availabilityStatus]} label={settings.availabilityNote ?? settings.availabilityStatus.toLowerCase()} />
            <SpineIndex items={indexItems} className="hidden lg:block" />
          </div>
        </aside>

        <div className="min-w-0">
          <h1 className="xl:pr-[180px]">
            {headline.map((line, i) => (
              <span key={i} className="block reveal" style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
                {line}
              </span>
            ))}
          </h1>
          <p className="reveal-quick mt-4 text-body-l text-ash max-w-[52ch]" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            {t(blocks, "home.hero.sub")}
          </p>
          <div className="reveal-quick mt-4 flex flex-wrap items-center gap-2" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <Button href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
          </div>

          <div className="reveal-quick mt-5 lg:mt-6 border-t border-divider-light pt-2 pb-4" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <SectionMarker as="p">{t(blocks, "home.live.label")}</SectionMarker>
            {live ? (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-[auto_auto_minmax(0,1fr)] gap-x-4 gap-y-1 items-center">
                <p className="data text-ink max-w-none">{live.slug}</p>
                <TagList items={live.stack} />
                <p className="data text-ash max-w-none md:text-right">{live.buildNote ?? ""}</p>
              </div>
            ) : (
              <p className="mt-2 data text-ash max-w-none">{t(blocks, "home.live.empty")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
