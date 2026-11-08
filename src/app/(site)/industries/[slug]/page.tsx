import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaFrame, Section } from "@/components/ui";
import { Magnetic } from "@/components/motion/magnetic";
import { Split, vars } from "@/components/motion/split";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { CtaButton } from "@/components/site/cta-button";
import { ClosingBand } from "@/components/site/services/closing-band";
import { FaqList } from "@/components/site/services/faq-list";
import { LossCalculator } from "@/components/site/services/loss-calculator";
import { rows, semis } from "@/components/site/services/parse";
import { SectionHead } from "@/components/site/services/section-head";
import { ServiceMotif } from "@/components/site/services/service-motif";
import { SystemFlow } from "@/components/site/services/system-flow";
import { getBlocks, t } from "@/lib/queries/content";
import { getConceptTeaser } from "@/lib/queries/industry";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

export const revalidate = 3600;
export const dynamicParams = false;

/**
 * One industry page so far. The slug maps to its ContentBlock prefix and group;
 * a second industry is a new entry here plus its blocks.
 */
const INDUSTRIES = {
  "home-services": { prefix: "industry.homeServices", group: "Industry: home services", concept: "lone-star-plumbing" },
} as const;

type Slug = keyof typeof INDUSTRIES;

function industry(slug: string) {
  return slug in INDUSTRIES ? INDUSTRIES[slug as Slug] : null;
}

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ind = industry((await params).slug);
  if (!ind) return {};
  const blocks = await getBlocks([ind.group]);
  return { title: t(blocks, `${ind.prefix}.meta.title`), description: t(blocks, `${ind.prefix}.meta.description`) };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const ind = industry((await params).slug);
  if (!ind) notFound();
  const [blocks, concept] = await Promise.all([getBlocks([ind.group]), getConceptTeaser(ind.concept)]);
  const k = (key: string) => t(blocks, `${ind.prefix}.${key}`);

  const facts = rows(k("hero.facts"), 2);
  const costs = rows(k("costs.items"), 2);
  const flow = rows(k("flow.items"), 4).map(([title, body, screen, time]) => ({ title, body, screen, time }));
  const trades = rows(k("trades.items"), 2);
  const packages = rows(k("packages.items"), 5);
  const suggested = k("packages.suggested").trim();
  const why = rows(k("why.items"), 2);
  const faqs = rows(k("faq.items"), 2);

  return (
    <main id="main" className="ind-page">
      {/* Hero */}
      <Section pad="none" className="ind-hero pt-[136px] md:pt-[176px] pb-4">
        <p className="cl-kicker" data-reveal="fade">{k("hero.kicker")}</p>
        <Split as="h1" text={k("hero.title")} className="mt-3 text-display-xl max-w-[16ch]" delay={80} />
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className="text-body-l text-ash max-w-[56ch]" data-reveal="up" style={vars({ "--d": 320 })}>{k("hero.sub")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2" data-reveal="up" style={vars({ "--d": 440 })}>
              <Magnetic>
                <CtaButton href="/#contact">{k("hero.cta")}</CtaButton>
              </Magnetic>
              <CtaButton href="#system" variant="ghost">{k("hero.ctaSecondary")}</CtaButton>
            </div>
          </div>
          <dl className="ind-facts" data-reveal="stagger" style={vars({ "--d": 520 })}>
            {facts.map(([figure, note]) => (
              <div key={figure} className="ind-fact">
                <dt className="ind-fact-figure">{figure}</dt>
                <dd className="ind-fact-note">{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {trades.length > 0 ? (
        <div className="ind-band" aria-hidden="true">
          <VelocityMarquee speed={2.4}>
            {trades.map(([trade]) => (
              <span key={trade} className="ind-band-item">
                {trade}
                <span className="ind-band-hex" />
              </span>
            ))}
          </VelocityMarquee>
        </div>
      ) : null}

      {/* What it costs now */}
      <Section pad="tall" id="costs">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
          <div>
            <SectionHead kicker={k("costs.kicker")} heading={k("costs.heading")} />
            <ul className="ind-costs" data-reveal="stagger">
              {costs.map(([title, note]) => (
                <li key={title} className="ind-cost">
                  <h3 className="ind-cost-title">{title}</h3>
                  <p className="ind-cost-note">{note}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:sticky lg:top-[112px]" data-reveal="up" style={vars({ "--d": 120 })}>
            <LossCalculator
              labels={{
                heading: k("calc.heading"),
                calls: k("calc.callsLabel"),
                value: k("calc.valueLabel"),
                currency: k("calc.currency"),
                result: k("calc.resultLabel"),
                note: k("calc.note"),
              }}
            />
          </div>
        </div>
      </Section>

      {/* The system */}
      <Section tone="paper" pad="none" id="system" className="ind-system pt-6 pb-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <SectionHead kicker={k("flow.kicker")} heading={k("flow.heading")} />
          <p className="text-body-l text-ash max-w-[44ch]" data-reveal="up">{k("flow.sub")}</p>
        </div>
        <div className="mt-4">
          <SystemFlow
            steps={flow}
            labels={{
              business: k("flow.business"),
              customer: k("flow.customer"),
              step: k("flow.stepLabel"),
              booked: k("flow.bookedLabel"),
              reviewLink: k("flow.reviewLink"),
              reply: k("flow.reply"),
              caption: k("flow.caption"),
            }}
          />
        </div>
      </Section>

      {/* Trades */}
      <Section pad="tall" id="trades">
        <SectionHead kicker={k("trades.kicker")} heading={k("trades.heading")} sub={k("trades.sub")} />
        <ul className="ind-trades" data-reveal="stagger">
          {trades.map(([trade, example]) => (
            <li key={trade} className="ind-trade cl-card cl-card-hover cl-spot">
              <span className="ind-trade-hex" aria-hidden="true" />
              <h3 className="ind-trade-name">{trade}</h3>
              <p className="ind-trade-text">{example}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Packages */}
      <Section tone="paper" pad="tall" id="packages">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <SectionHead kicker={k("packages.kicker")} heading={k("packages.heading")} />
          <p className="text-body-l text-ash max-w-[44ch]" data-reveal="up">{k("packages.sub")}</p>
        </div>
        <ul className="ind-packages" data-reveal="stagger">
          {packages.map(([name, price, terms, who, included]) => {
            const isSuggested = suggested !== "" && name === suggested;
            return (
              <li key={name} className={cx("ind-pack cl-spot", isSuggested ? "ind-pack--dark section-dark on-dark" : "cl-card")}>
                {isSuggested ? <span className="cl-chip cl-chip--lime ind-pack-tag">{k("packages.suggestedLabel")}</span> : null}
                <h3 className="ind-pack-name">{name}</h3>
                <span className="ind-pack-price">{price}</span>
                <p className="data ind-pack-terms">{terms}</p>
                <p className="ind-pack-who">{who}</p>
                <p className="ind-pack-label">{k("packages.includedLabel")}</p>
                <ul className="ind-pack-list">
                  {semis(included).map((item) => (
                    <li key={item}>
                      <span className="ind-tick" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="ind-pack-cta">
                  <CtaButton href="/#contact" variant={isSuggested ? "lime" : "ink"} size="sm">{k("packages.cta")}</CtaButton>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Why a new studio */}
      <Section pad="tall" id="why">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <div className="lg:sticky lg:top-[120px]">
              <SectionHead kicker={k("why.kicker")} heading={k("why.heading")} sub={k("why.sub")} />
            </div>
          </div>
          <ol className="ind-why" data-reveal="stagger">
            {why.map(([title, note]) => (
              <li key={title} className="ind-why-item">
                <span className="ind-why-hex" aria-hidden="true" />
                <div>
                  <h3 className="ind-why-title">{title}</h3>
                  <p className="ind-why-note">{note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Concept teaser: only when the project is published */}
      {concept ? (
        <Section pad="none" className="pb-6" id="example">
          <Link href={`/work/${concept.slug}`} className="ind-concept cl-spot" data-cursor="view" data-cursor-label={k("concept.cursor")} data-reveal="up">
            <div className="ind-concept-copy">
              <p className="cl-kicker">{k("concept.kicker")}</p>
              <h2 className="mt-2 text-h2">{k("concept.heading")}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-1">
                <span className="cl-chip cl-chip--lime">{k("concept.tag")}</span>
                <span className="ind-concept-title">{concept.title}</span>
              </div>
              <p className="mt-2 text-body text-ash max-w-[52ch]">{concept.summary}</p>
              <p className="mt-2 text-small text-ash max-w-[52ch]">{k("concept.note")}</p>
              <span className="mt-3 ind-concept-link">
                <span className="cl-link cl-link--always">{k("concept.link")}</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                  <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <div className="ind-concept-visual">
              {concept.cover ? (
                <MediaFrame ratio={16 / 10} blurDataUrl={concept.cover.blurDataUrl ?? undefined}>
                  <img {...imageSrcSet(concept.cover.keyPrefix, concept.cover.variants)} sizes="(min-width: 1024px) 560px, 100vw" alt={concept.cover.alt ?? ""} width={concept.cover.width ?? 16} height={concept.cover.height ?? 10} loading="lazy" decoding="async" />
                </MediaFrame>
              ) : (
                <div className="sv-motif-frame ind-concept-motif">
                  <ServiceMotif slug="business-automation" />
                </div>
              )}
            </div>
          </Link>
        </Section>
      ) : null}

      {/* FAQ */}
      {faqs.length > 0 ? (
        <Section pad="base" className="pb-6" id="questions">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <SectionHead kicker={k("faq.kicker")} heading={k("faq.heading")} />
            <FaqList idPrefix="ind-faq" items={faqs.map(([question, answer]) => ({ question, answer: <p className="text-body text-ink max-w-[68ch]">{answer}</p> }))} />
          </div>
        </Section>
      ) : null}

      <ClosingBand
        heading={k("cta.heading")}
        sub={k("cta.sub")}
        cta={{ href: "/#contact", label: k("cta.button") }}
        secondary={{ href: "/#services", label: k("cta.secondary") }}
      />
    </main>
  );
}
