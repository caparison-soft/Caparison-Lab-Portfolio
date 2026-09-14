import { SectionMarker, Section, Spine } from "@/components/ui";
import { ProcessCards } from "@/components/site/home/process-cards";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { ProcessItem } from "@/lib/queries/home";

type ProcessStripProps = { blocks: Blocks; steps: ProcessItem[] };

/**
 * The process section: the steps as pinned cards along a dashed path
 * (see ProcessCards). Each step carries its duration in mono.
 */
export function ProcessStrip({ blocks, steps }: ProcessStripProps) {
  return (
    <Section id="process" tone="paper" pad="base">
      <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "home.process.marker")}</SectionMarker>}>
        <p className="text-h3 font-bold max-w-none mb-4">{t(blocks, "home.process.heading")}</p>
        <ProcessCards steps={steps} />
      </Spine>
    </Section>
  );
}
