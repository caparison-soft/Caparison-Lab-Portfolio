import { SectionMarker, Section, Spine } from "@/components/ui";
import { CapabilitySlider } from "@/components/site/home/capability-slider";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CapabilityItem } from "@/lib/queries/home";

type CapabilitySheetProps = { blocks: Blocks; items: CapabilityItem[] };

/** "What we build": titles on the left, the hovered capability's image on the right. */
export function CapabilitySheet({ blocks, items }: CapabilitySheetProps) {
  return (
    <Section id="capabilities" pad="tall" className="pb-5">
      <Spine rail={<SectionMarker as="h2">{t(blocks, "home.capabilities.marker")}</SectionMarker>}>
        <p className="text-h2 font-bold tracking-[-0.02em] max-w-none mb-4">{t(blocks, "home.capabilities.heading")}</p>
        <CapabilitySlider items={items} />
      </Spine>
    </Section>
  );
}
