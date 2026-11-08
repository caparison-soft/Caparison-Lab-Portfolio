import Link from "next/link";
import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { OrbitHero, type OrbitService } from "./orbit-hero";
import { OrbitHeadline } from "./headline";
import { ServiceVisual } from "./visuals";
import type { ServiceId } from "./icons";

/** Orbit order, and where each card's "See how" goes on /services. */
const SERVICES: { id: ServiceId; href: string }[] = [
  { id: "websites", href: "/#services" },
  { id: "automation", href: "/#services" },
  { id: "crm", href: "/#services" },
  { id: "pipeline", href: "/#services" },
  { id: "production", href: "/#services" },
  { id: "ads", href: "/#services" },
];

/** The home hero (owner, 2026-11-07): headline, one line, two actions, the service orbit. Server component. */
export function HomeHero({ blocks }: { blocks: Blocks }) {
  const example = t(blocks, "home.orbit.example");
  const services: OrbitService[] = SERVICES.map(({ id, href }) => ({
    id,
    href,
    name: t(blocks, `home.orbit.${id}.name`),
    pitch: t(blocks, `home.orbit.${id}.pitch`),
    items: lines(t(blocks, `home.orbit.${id}.items`)),
    price: t(blocks, `home.orbit.${id}.price`),
    visual: <ServiceVisual id={id} lines={lines(t(blocks, `home.orbit.${id}.visual`))} example={example} />,
  }));

  return (
    <OrbitHero
      services={services}
      labels={{ group: t(blocks, "home.orbit.label"), seeHow: t(blocks, "home.orbit.seeHow"), close: t(blocks, "home.orbit.close") }}
    >
      <OrbitHeadline text={t(blocks, "home.hero.title")} />
      <p className="ob-sub">{t(blocks, "home.hero.lead")}</p>
      <div className="ob-ctas">
        <Link href="/#work" className="ob-ghost">{t(blocks, "home.hero.ctaSecondary")}</Link>
        <ArrowFillButton label={t(blocks, "home.hero.cta")} href="/#contact" />
      </div>
    </OrbitHero>
  );
}
