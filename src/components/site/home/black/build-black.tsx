import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split } from "@/components/motion/split";
import type { ServiceId } from "@/components/site/home/orbit/icons";
import { BuildSlider, type BuildItem } from "./build-slider";
import { ServiceDemo } from "./service-demo";

const SERVICES: { id: ServiceId; href: string }[] = [
  { id: "websites", href: "/#pricing" },
  { id: "automation", href: "/#pricing" },
  { id: "crm", href: "/#pricing" },
  { id: "pipeline", href: "/#pricing" },
  { id: "production", href: "/#pricing" },
  { id: "ads", href: "/#pricing" },
];

/** Home on black: "What we build", the six services one by one (owner, 2026-11-07). Server component. */
export function BuildBlack({ blocks }: { blocks: Blocks }) {
  const example = t(blocks, "home.orbit.example");
  const items: BuildItem[] = SERVICES.map(({ id, href }) => ({
    id,
    href,
    name: t(blocks, `home.orbit.${id}.name`),
    blurb: t(blocks, `home.orbit.${id}.pitch`),
    price: t(blocks, `home.orbit.${id}.price`),
    timeline: t(blocks, `home.orbit.${id}.timeline`),
    media: t(blocks, `home.orbit.${id}.media`),
    demo: <ServiceDemo id={id} lines={lines(t(blocks, `home.orbit.${id}.visual`))} example={example} />,
  }));
  return (
    <section id="services" className="scroll-mt-[80px] px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-build-heading">
      <div className="max-w-layout mx-auto">
        {/* Centred, no label above it (owner, 2026-11-07). */}
        <Split as="h2" id="hb-build-heading" text={t(blocks, "home.build.heading")} className="hb-h2 text-center" />
        <div className="mt-5 lg:mt-6" data-reveal="up">
          <BuildSlider items={items} seeHow={t(blocks, "home.build.link")} />
        </div>
      </div>
    </section>
  );
}
