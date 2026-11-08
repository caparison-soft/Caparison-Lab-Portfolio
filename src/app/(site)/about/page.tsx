import type { Metadata } from "next";
import { Split, vars } from "@/components/motion/split";
import { CountUp } from "@/components/motion/count-up";
import { Paragraphs, RichText } from "@/components/site/rich-text";
import { FaqList } from "@/components/site/faq-list";
import { CtaButton } from "@/components/site/cta-button";
import { getBlocks, lines, t } from "@/lib/queries/content";
import { getProcessSteps } from "@/lib/queries/home";
import { getFaqs, getStats, getTeam } from "@/lib/queries/about";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["About", "Navigation"]);
  return { title: t(blocks, "nav.about"), description: t(blocks, "about.lead") };
}

const gutter = "px-3 md:px-[48px]";

/** Studio, how we work, numbers, process, team, questions. Light redesign (owner, 2026-11-05). */
export default async function AboutPage() {
  const [blocks, team, stats, steps, faqs] = await Promise.all([
    getBlocks(["About", "Navigation"]),
    getTeam(),
    getStats(),
    getProcessSteps(),
    getFaqs(),
  ]);
  const values = lines(t(blocks, "about.values")).map((l) => {
    const [title, text = ""] = l.split("|").map((s) => s.trim());
    return { title, text };
  });

  return (
    <main id="main">
      <section className={`wk-top ${gutter} pb-6`}>
        <div className="max-w-layout mx-auto">
          <p className="cl-kicker" data-reveal="up">{t(blocks, "about.kicker")}</p>
          <Split as="h1" text={t(blocks, "about.heading")} className="mt-2 text-mega max-w-[18ch]" />
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4 lg:gap-6 border-t border-divider-light pt-4">
            <p className="text-h3 text-ink max-w-[26ch]" data-reveal="up">{t(blocks, "about.lead")}</p>
            <div data-reveal="up" style={vars({ "--d": 120 })}>
              <Paragraphs className="text-body-l text-ash" text={t(blocks, "about.body")} />
            </div>
          </div>
        </div>
      </section>

      {stats.length > 0 ? (
        <section className={`bg-paper ${gutter} py-5`} aria-label={t(blocks, "about.statsHeading")}>
          <dl className="max-w-layout mx-auto m-0 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-4" data-reveal="stagger">
            {stats.map((s, i) => (
              <div key={i} className="border-t border-ink pt-2 flex flex-col-reverse justify-end">
                <dt className="text-small text-ash mt-1">{s.label}</dt>
                <dd className="m-0 font-mono text-display-l text-ink tabular-nums leading-none"><CountUp value={s.value} /></dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {values.length > 0 ? (
        <section className={`${gutter} py-6 lg:py-7`} aria-labelledby="about-values">
          <div className="max-w-layout mx-auto">
            <p className="cl-kicker" data-reveal="up">{t(blocks, "about.valuesKicker")}</p>
            <Split as="h2" id="about-values" text={t(blocks, "about.valuesHeading")} className="mt-2 text-display-xl max-w-[16ch]" />
            <ul className="wk-values mt-5" data-reveal="stagger">
              {values.map((v, i) => (
                <li key={v.title} className="cl-card cl-card-hover cl-spot wk-value">
                  <span className="wk-value-n">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-h3 text-ink">{v.title}</h3>
                  <p className="mt-1 text-body text-ash max-w-[44ch]">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <section className={`section-dark on-dark ${gutter} py-6 lg:py-7`} aria-labelledby="about-process">
          <div className="max-w-layout mx-auto">
            <p className="cl-kicker" data-reveal="up">{t(blocks, "about.processKicker")}</p>
            <Split as="h2" id="about-process" text={t(blocks, "about.processHeading")} className="mt-2 text-display-xl text-bone max-w-[16ch]" />
            <ol className="wk-steps mt-5" data-reveal="stagger">
              {steps.map((s, i) => (
                <li key={s.title} className="wk-step">
                  <span className="wk-step-n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-h3 text-bone">{s.title}</h3>
                    {s.duration ? <p className="data text-sage mt-[4px] max-w-none">{s.duration}</p> : null}
                  </div>
                  <p className="col-start-2 lg:col-start-auto text-body text-sage max-w-[52ch]">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {team.length > 0 ? (
        <section className={`${gutter} py-6 lg:py-7`} aria-labelledby="about-team">
          <div className="max-w-layout mx-auto">
            <p className="cl-kicker" data-reveal="up">{t(blocks, "about.teamKicker")}</p>
            <Split as="h2" id="about-team" text={t(blocks, "about.teamHeading")} className="mt-2 text-display-xl max-w-[16ch]" />
            <ul className="wk-team mt-5" data-reveal="stagger">
              {team.map((m) => (
                <li key={m.name} className="cl-card cl-spot p-3">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" width={64} height={64} className="wk-avatar" loading="lazy" />
                  ) : (
                    <span className="wk-avatar" aria-hidden="true">{m.name.slice(0, 1)}</span>
                  )}
                  <h3 className="mt-3 text-h4 font-bold text-ink">{m.name}</h3>
                  <p className="text-small text-ash max-w-none">{m.role}</p>
                  {m.bio ? <p className="mt-2 text-body text-ash">{m.bio}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className={`bg-paper ${gutter} py-6 lg:py-7`} aria-labelledby="about-faq">
          <div className="max-w-layout mx-auto grid gap-5 lg:grid-cols-[5fr_7fr]">
            <div className="lg:sticky lg:top-[140px] self-start">
              <p className="cl-kicker" data-reveal="up">{t(blocks, "about.faqKicker")}</p>
              <Split as="h2" id="about-faq" text={t(blocks, "about.faqHeading")} className="mt-2 text-display-l max-w-[14ch]" />
            </div>
            <div data-reveal="up">
              <FaqList items={faqs.map((f) => ({ question: f.question, answer: <RichText content={f.answer} /> }))} />
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${gutter} py-6 lg:py-7`}>
        <div className="max-w-layout mx-auto">
          <div className="wk-band on-dark" data-reveal="up">
            <span className="wk-band-hex" aria-hidden="true" />
            <div className="relative max-w-[640px]">
              <h2 className="text-display-l text-bone">{t(blocks, "about.ctaHeading")}</h2>
              <p className="mt-2 text-body-l text-sage max-w-[52ch]">{t(blocks, "about.ctaSub")}</p>
              <div className="mt-4">
                <CtaButton href="/#contact">{t(blocks, "about.ctaButton")}</CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
