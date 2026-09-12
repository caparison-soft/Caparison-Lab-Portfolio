import type { Metadata } from "next";
import { Section, SectionMarker, Spine } from "@/components/ui";
import { Paragraphs, RichText } from "@/components/site/rich-text";
import { ProcessStrip } from "@/components/site/home/process-strip";
import { getBlocks, t } from "@/lib/queries/content";
import { getProcessSteps } from "@/lib/queries/home";
import { getFaqs, getStats, getTeam } from "@/lib/queries/about";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["About"]);
  return { title: t(blocks, "about.heading") };
}

/** Studio, team, stats, process, questions. */
export default async function AboutPage() {
  const [blocks, team, stats, steps, faqs] = await Promise.all([
    getBlocks(["About", "Homepage", "Navigation"]),
    getTeam(),
    getStats(),
    getProcessSteps(),
    getFaqs(),
  ]);

  return (
    <main id="main">
      <Section pad="tall">
        <Spine sticky={false} rail={<SectionMarker>{t(blocks, "nav.about")}</SectionMarker>}>
          <h1 className="text-display-l">{t(blocks, "about.heading")}</h1>
          <Paragraphs className="mt-4 text-body-l text-ash" text={t(blocks, "about.body")} />
        </Spine>
      </Section>

      {stats.length > 0 ? (
        <Section pad="none" className="pb-6">
          <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "about.statsHeading")}</SectionMarker>}>
            <div className="sheet grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className="p-3 bg-bone">
                  <p className="font-mono text-h2 text-ink max-w-none tabular-nums">{s.value}</p>
                  <p className="text-small text-ash max-w-none mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </Spine>
        </Section>
      ) : null}

      {team.length > 0 ? (
        <Section pad="base" className="pt-0">
          <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "about.teamHeading")}</SectionMarker>}>
            <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 gap-3">
              {team.map((m) => (
                <li key={m.name} className="border-t border-divider-light pt-2">
                  <p className="text-h4 font-medium text-ink max-w-none">{m.name}</p>
                  <p className="text-small text-ash max-w-none">{m.role}</p>
                  {m.bio ? <p className="mt-1 text-body text-ash">{m.bio}</p> : null}
                </li>
              ))}
            </ul>
          </Spine>
        </Section>
      ) : null}

      <ProcessStrip blocks={blocks} steps={steps} />

      {faqs.length > 0 ? (
        <Section pad="tall">
          <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "about.faqHeading")}</SectionMarker>}>
            <div className="border-t border-divider-light max-w-[720px]">
              {faqs.map((f, i) => (
                <details key={i} className="faq border-b border-divider-light group">
                  <summary className="list-none cursor-pointer py-2 pr-4 relative text-h4 font-medium text-ink select-none">
                    {f.question}
                    <span aria-hidden="true" className="absolute right-0 top-[18px] w-2 h-2 text-ash faq-icon" />
                  </summary>
                  <div className="pb-3 text-body text-ash [&_p]:text-ash">
                    <RichText content={f.answer} />
                  </div>
                </details>
              ))}
            </div>
          </Spine>
        </Section>
      ) : null}
    </main>
  );
}
