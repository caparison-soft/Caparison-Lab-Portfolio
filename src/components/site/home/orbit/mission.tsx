import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { parseAccent } from "@/lib/accent";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { ServiceIcon, type ServiceId } from "./icons";

const ICONS: ServiceId[] = ["websites", "automation", "crm", "ads"];

/** The row under the hero: what goes wrong, in one paragraph, and the way to the services. Server component. */
export function HomeMission({ blocks }: { blocks: Blocks }) {
  return (
    <section className="ob-mission">
      <p className="ob-mission-text" data-reveal="up">
        {parseAccent(t(blocks, "home.mission.text")).map((r, i) => (r.accent ? <span key={i} className="hb-lf">{r.text}</span> : r.text))}
      </p>
      <div className="ob-mission-side" data-reveal="up">
        <div className="ob-mission-icons" aria-hidden="true">
          {ICONS.map((id) => <span key={id}><ServiceIcon id={id} /></span>)}
        </div>
        <div>
          <p className="ob-mission-count">{t(blocks, "home.mission.count")}</p>
          <p className="ob-mission-note">{t(blocks, "home.mission.countNote")}</p>
          <ArrowFillButton label={t(blocks, "home.mission.link")} href="/#services" size="sm" className="mt-2" />
        </div>
      </div>
    </section>
  );
}
