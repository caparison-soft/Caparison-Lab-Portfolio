import type { Metadata } from "next";
import { MediaFrame, Section } from "@/components/ui";
import { Magnetic } from "@/components/motion/magnetic";
import { Split, vars } from "@/components/motion/split";
import { CtaButton } from "@/components/site/cta-button";
import { RichText } from "@/components/site/rich-text";
import { ClosingBand } from "@/components/site/services/closing-band";
import { FaqList } from "@/components/site/services/faq-list";
import { Parallax } from "@/components/site/services/parallax";
import { rows } from "@/components/site/services/parse";
import { ProcessTimeline } from "@/components/site/services/process-timeline";
import { SectionHead } from "@/components/site/services/section-head";
import { ServiceIndex } from "@/components/site/services/service-index";
import { ServiceMotif } from "@/components/site/services/service-motif";
import { getFaqs } from "@/lib/queries/about";
import { getBlocks, t, type Blocks } from "@/lib/queries/content";
import { getCapabilities, getProcessSteps, type CapabilityItem } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";
import { Starfield } from "@/components/site/home/black/starfield";

export const revalidate = 3600;

const GROUPS = ["Services page"];
/** How far each hero tile drifts up as the hero scrolls away, so the row breaks apart a little. */
const DRIFT = [-30, -90, -50, -110];

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(GROUPS);
  return { title: t(blocks, "services.meta.title"), description: t(blocks, "services.meta.description") };
}

/**
 * /services (light redesign, 2026-11-05). The four service groups are the
 * published Capability rows; everything else on the page is a ContentBlock in
 * the "Services page" group (prisma/blocks/services.ts). Replaces /capabilities,
 * which now redirects here, anchors included.
 */
export default async function ServicesPage() {
  const [blocks, groups, steps, faqs] = await Promise.all([getBlocks(GROUPS), getCapabilities(), getProcessSteps(), getFaqs()]);
  const pricing = rows(t(blocks, "services.pricing.items"), 2);

  return (
    <main id="main" className="sv-page theme-dark">
      <Starfield />
      {/* Hero */}
      <Section pad="none" className="pt-[136px] md:pt-[176px] pb-5 md:pb-6">
        <p className="cl-kicker" data-reveal="fade">{t(blocks, "services.hero.kicker")}</p>
        <Split as="h1" text={t(blocks, "services.hero.title")} className="mt-3 text-display-xl max-w-[22ch]" delay={80} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <p className="text-body-l text-ash max-w-[54ch]" data-reveal="up" style={vars({ "--d": 320 })}>{t(blocks, "services.hero.sub")}</p>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end" data-reveal="up" style={vars({ "--d": 440 })}>
            <Magnetic>
              <CtaButton href="/contact?type=review">{t(blocks, "services.hero.cta")}</CtaButton>
            </Magnetic>
            <CtaButton href="/industries/home-services" variant="ghost">{t(blocks, "services.hero.ctaSecondary")}</CtaButton>
          </div>
        </div>
        {groups.length > 0 ? (
          <nav aria-label={t(blocks, "services.hero.jumpLabel")} className="sv-tiles mt-5">
            {groups.map((c, i) => (
              <Parallax key={c.slug} distance={DRIFT[i % DRIFT.length]}>
                <HeroTile c={c} delay={i * 90} />
              </Parallax>
            ))}
          </nav>
        ) : null}
      </Section>

      {/* The four groups, with the sticky index on lg+ */}
      <Section id="groups" pad="none" className="pb-6">
        <div className="grid gap-4 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-5">
          <aside className="hidden lg:block">
            <div className="sticky top-[112px]">
              <ServiceIndex label={t(blocks, "services.index.label")} items={groups.map((g) => ({ slug: g.slug, title: g.title }))} />
            </div>
          </aside>
          <div className="flex flex-col gap-3">
            {groups.map((c, i) => <ServiceGroup key={c.slug} c={c} index={i} blocks={blocks} />)}
          </div>
        </div>
      </Section>

      {/* How we price */}
      <Section tone="paper" pad="tall" className="sv-pricing">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <SectionHead kicker={t(blocks, "services.pricing.kicker")} heading={t(blocks, "services.pricing.heading")} sub={t(blocks, "services.pricing.sub")} />
          <ul className="sv-price-grid" data-reveal="stagger">
            {pricing.map(([figure, note]) => (
              <li key={figure} className="sv-price">
                <span className="sv-price-line" aria-hidden="true" />
                <span className="sv-price-figure">{figure}</span>
                <p className="sv-price-note">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Process */}
      {steps.length > 0 ? (
        <Section pad="tall" id="process">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <div className="lg:sticky lg:top-[120px]">
                <SectionHead kicker={t(blocks, "services.process.kicker")} heading={t(blocks, "services.process.heading")} sub={t(blocks, "services.process.sub")} />
              </div>
            </div>
            <ProcessTimeline steps={steps.map((s) => ({ title: s.title, description: s.description, duration: s.duration }))} />
          </div>
        </Section>
      ) : null}

      {/* FAQ */}
      {faqs.length > 0 ? (
        <Section pad="base" className="pb-6" id="questions">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <SectionHead kicker={t(blocks, "services.faq.kicker")} heading={t(blocks, "services.faq.heading")} />
            <FaqList idPrefix="sv-faq" items={faqs.map((f) => ({ question: f.question, answer: <RichText content={f.answer} /> }))} />
          </div>
        </Section>
      ) : null}

      <ClosingBand
        heading={t(blocks, "services.cta.heading")}
        sub={t(blocks, "services.cta.sub")}
        cta={{ href: "/contact?type=review", label: t(blocks, "services.cta.button") }}
        secondary={{ href: "/work", label: t(blocks, "services.cta.secondary") }}
      />
    </main>
  );
}

function HeroTile({ c, delay }: { c: CapabilityItem; delay: number }) {
  return (
    <a href={`#${c.slug}`} className="sv-tile cl-spot" data-reveal="up" style={vars({ "--d": 200 + delay })}>
      <ServiceMotif slug={c.slug} className="sv-tile-motif" />
      <span className="sv-tile-title">{c.title}</span>
      {c.startingPrice ? <span className="data sv-tile-price">{c.startingPrice}</span> : null}
    </a>
  );
}

function ServiceGroup({ c, index, blocks }: { c: CapabilityItem; index: number; blocks: Blocks }) {
  const titleId = `${c.slug}-title`;
  return (
    <article id={c.slug} aria-labelledby={titleId} className={cx("sv-group cl-card cl-spot", index % 2 === 1 && "sv-group--flip")}>
      <div className="sv-group-top">
        <div className="sv-group-copy">
          <h2 id={titleId} className="text-display-l">{c.title}</h2>
          <p className="mt-2 text-body-l text-ash max-w-[46ch]">{c.blurb}</p>
          {c.startingPrice || c.typicalTimeline ? (
            <dl className="sv-facts">
              {c.startingPrice ? (
                <div>
                  <dt>{t(blocks, "services.group.priceLabel")}</dt>
                  <dd className="data">{c.startingPrice}</dd>
                </div>
              ) : null}
              {c.typicalTimeline ? (
                <div>
                  <dt>{t(blocks, "services.group.timelineLabel")}</dt>
                  <dd className="data">{c.typicalTimeline}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <div className="mt-3">
            <CtaButton href="/contact" variant="ink" size="sm">{t(blocks, "services.group.cta")}</CtaButton>
          </div>
        </div>
        <div className="sv-group-visual">
          {c.image ? (
            <MediaFrame ratio={16 / 10} blurDataUrl={c.image.blurDataUrl ?? undefined} className="sv-group-media">
              <img {...imageSrcSet(c.image.keyPrefix, c.image.variants)} sizes="(min-width: 1024px) 480px, 100vw" alt={c.image.alt ?? ""} width={c.image.width ?? 16} height={c.image.height ?? 10} loading="lazy" decoding="async" />
            </MediaFrame>
          ) : (
            <div className="sv-motif-frame">
              <ServiceMotif slug={c.slug} />
            </div>
          )}
        </div>
      </div>
      {c.deliverables.length > 0 ? (
        <div className="sv-group-list">
          <p className="sv-group-list-label">{t(blocks, "services.group.includedLabel")}</p>
          <ul className="sv-items" data-reveal="stagger">
            {c.deliverables.map((d) => (
              <li key={d} className="sv-item">
                <span className="sv-item-hex" aria-hidden="true" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
