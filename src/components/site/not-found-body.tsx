import { HexMark } from "@/components/site/hex-mark";
import { CtaButton } from "@/components/site/cta-button";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";

/**
 * The 404 body, shared by the root not-found (unmatched URLs) and the
 * (site) group's (notFound() calls). The zero is the brand mark, turning
 * slowly; reduced motion holds it still. Server component.
 */
export function NotFoundBody({ blocks }: { blocks: Blocks }) {
  return (
    <main id="main">
      <section className="wk-top px-3 md:px-[48px] pb-6 lg:pb-7">
        <div className="max-w-layout mx-auto min-h-[56svh] flex flex-col justify-center">
          <p className="wk-404" aria-hidden="true">
            4<HexMark className="wk-404-mark" aperture="bone" />4
          </p>
          <p className="cl-kicker mt-4">{t(blocks, "notFound.kicker")}</p>
          <h1 className="mt-2 text-display-xl max-w-[16ch]">{t(blocks, "notFound.heading")}</h1>
          <p className="mt-3 text-body-l text-ash max-w-[52ch]">{t(blocks, "notFound.body")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CtaButton href="/">{t(blocks, "notFound.ctaLabel")}</CtaButton>
            <CtaButton href="/#work" variant="ghost">{t(blocks, "notFound.workLabel")}</CtaButton>
          </div>
        </div>
      </section>
    </main>
  );
}
