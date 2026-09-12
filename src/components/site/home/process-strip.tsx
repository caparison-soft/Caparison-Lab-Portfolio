import { SectionMarker, Section, Spine } from "@/components/ui";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { ProcessItem } from "@/lib/queries/home";
import { pad2 } from "@/lib/format";

type ProcessStripProps = { blocks: Blocks; steps: ProcessItem[] };

/**
 * The short section. A real sequence, so it gets numbers. Each step carries
 * its duration in mono: the hero promise restated as data.
 */
export function ProcessStrip({ blocks, steps }: ProcessStripProps) {
  return (
    <Section id="process" tone="paper" pad="short">
      <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "home.process.marker")}</SectionMarker>}>
        <p className="text-h3 font-bold max-w-none mb-3">{t(blocks, "home.process.heading")}</p>
        <ol className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-3 md:gap-x-3 divide-y md:divide-y-0 md:divide-x divide-divider-light">
          {steps.map((s) => (
            <li key={s.order} className="pt-2 md:pt-0 md:pl-3 first:pl-0 first:pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-small font-medium text-ash tabular-nums">{pad2(s.order)}</span>
                <h3 className="text-h4 font-medium">{s.title}</h3>
              </div>
              {s.duration ? <p className="data text-ash mt-[4px] max-w-none">{s.duration}</p> : null}
              <p className="mt-1 text-small text-ash max-w-[36ch]">{s.description}</p>
            </li>
          ))}
        </ol>
      </Spine>
    </Section>
  );
}
