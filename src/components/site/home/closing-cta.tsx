import type { Blocks, Settings } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { CtaButton } from "@/components/site/cta-button";
import { SpinningHex } from "./spinning-hex";

/** The closing offer on a lime band: ink type, ink button, a turning hex outline. */
export function ClosingCta({ blocks, settings }: { blocks: Blocks; settings: Settings }) {
  return (
    <section className="closing-cta relative overflow-hidden bg-lime text-ink px-3 md:px-[48px] py-6 lg:py-7">
      <SpinningHex />
      <div className="relative max-w-layout mx-auto">
        <Split as="h2" text={t(blocks, "home.cta.heading")} className="text-display-xl cl-display max-w-[16ch]" />
        <p className="mt-3 text-body-l max-w-[52ch]" data-reveal="up">{t(blocks, "home.cta.sub")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3" data-reveal="up">
          <Magnetic strength={0.3}>
            <CtaButton href="/contact?type=review" variant="ink">{t(blocks, "nav.cta")}</CtaButton>
          </Magnetic>
          <p className="text-body-l max-w-none">
            {t(blocks, "home.cta.secondary")} <a href={`mailto:${settings.email}`} className="cl-link cl-link--always text-ink">{settings.email}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
