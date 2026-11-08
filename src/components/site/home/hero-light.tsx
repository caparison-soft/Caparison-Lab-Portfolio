import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split, vars } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { CtaButton } from "@/components/site/cta-button";
import { DotField } from "./dot-field";
import { LeadFlowDemo, type DemoCopy } from "./lead-flow-demo";

const DEMO_KEYS = ["business", "caption", "reqLabel", "reqTitle", "reqName", "reqPlace", "reqTime", "reqSource", "smsLabel", "smsOut", "smsIn", "bookLabel", "bookValue", "statsLabel", "statsValue", "statsNote", "reviewLabel", "reviewNote"] as const;

/**
 * The home hero (light redesign). Left: availability, the headline rising in
 * word by word, the offer, two actions and three promises. Right: the lead
 * flow motion graphic. The interactive dot field sits behind both.
 */
export function HeroLight({ blocks }: { blocks: Blocks }) {
  const demo = Object.fromEntries(DEMO_KEYS.map((k) => [k, t(blocks, `home.demo.${k}`)])) as DemoCopy;
  return (
    <section className="hero-light relative overflow-hidden px-3 md:px-[48px] pt-[120px] pb-6 lg:pt-[136px] lg:min-h-[100svh] flex items-center">
      <DotField className="hero-dots absolute inset-0 w-full h-full" />
      <div className="relative max-w-layout mx-auto w-full grid gap-5 lg:gap-4 lg:grid-cols-[1.08fr_1fr] items-center">
        <div>
          <p className="cl-pill" data-reveal="up">
            <span className="cl-live" aria-hidden="true" />
            {t(blocks, "home.hero.status")}
          </p>
          <Split as="h1" text={t(blocks, "home.hero.title")} className="hero-title mt-3" delay={120} />
          <p className="mt-3 text-body-l text-ash max-w-[52ch]" data-reveal="up" style={vars({ "--d": 420 })}>
            {t(blocks, "home.hero.lead")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2" data-reveal="up" style={vars({ "--d": 560 })}>
            <Magnetic strength={0.25}>
              <CtaButton href="/contact?type=review">{t(blocks, "home.hero.cta")}</CtaButton>
            </Magnetic>
            <CtaButton href="/work" variant="ghost" arrow={false}>{t(blocks, "home.hero.ctaSecondary")}</CtaButton>
          </div>
          <ul className="mt-4 list-none p-0 m-0 flex flex-wrap gap-x-3 gap-y-1" data-reveal="stagger" style={vars({ "--d": 700 })}>
            {lines(t(blocks, "home.hero.proof")).map((item) => (
              <li key={item} className="flex items-center gap-1 text-small font-medium">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="w-[16px] h-[16px] flex-none">
                  <circle cx="8" cy="8" r="8" fill="var(--color-olive-950)" />
                  <path d="m4.8 8.2 2.1 2.1 4.3-4.4" stroke="var(--color-lime)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal="scale" style={vars({ "--d": 300 })} className="lg:pl-3">
          <LeadFlowDemo copy={demo} />
        </div>
      </div>
    </section>
  );
}
