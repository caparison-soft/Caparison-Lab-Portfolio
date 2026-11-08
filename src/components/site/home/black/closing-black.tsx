import type { Blocks, Settings } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { Fragment } from "react";
import { vars } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { parseAccent, plainAccent } from "@/lib/accent";
import { ClosingFx } from "./closing-fx";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { HbLink } from "./hb-link";

/**
 * Faint Leaf rings behind the closing offer: three still circles, one dashed
 * ring turning slowly and a small Leaf dot riding the outer ring, clear of the text. CSS only;
 * reduced motion stops both turns.
 */
function Rings() {
  return (
    <div className="hbc-field" aria-hidden="true">
      <div className="hbc-rings">
        <span className="hbc-glow" />
        <svg viewBox="0 0 800 800" fill="none" className="hbc-svg">
          <circle cx="400" cy="400" r="396" className="hbc-ring hbc-ring--far" />
          <circle cx="400" cy="400" r="300" className="hbc-ring" />
          <circle cx="400" cy="400" r="204" className="hbc-ring hbc-ring--near" />
          <g className="hbc-spin">
            <circle cx="400" cy="400" r="348" className="hbc-ring hbc-ring--dash" />
          </g>
          <g className="hbc-orbit">
            <circle cx="400" cy="4" r="5" className="hbc-dot" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * The heading, split into words that rise like <Split>'s (same classes, same
 * reveal), with the asterisk-marked words in Leaf and a line drawn under them
 * once the heading is in.
 */
function Heading({ text }: { text: string }) {
  let i = 0;
  return (
    <h2 id="hb-closing-heading" className="hbc-h mx-auto max-w-[17ch]" data-reveal="words">
      <span className="sr-only">{plainAccent(text)}</span>
      <span aria-hidden="true">
        {parseAccent(text).map((run, ri) => {
          const words = run.text.split(/\s+/).filter(Boolean);
          const spans = words.map((w, wi) => (
            <Fragment key={wi}>
              <span className="cl-w"><span className="cl-wi" style={vars({ "--i": i++ })}>{w}</span></span>
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ));
          const lead = /^\s/.test(run.text) ? " " : "", tail = /\s$/.test(run.text) ? " " : "";
          return (
            <Fragment key={ri}>
              {lead}
              {run.accent ? <span className="hbc-mark">{spans}</span> : spans}
              {tail}
            </Fragment>
          );
        })}
      </span>
    </h2>
  );
}

/**
 * Home on black: the closing offer, centred over Leaf rings. A light follows
 * the pointer, the rings lean and open with the scroll, the button pulls
 * toward the pointer and sends out a slow sonar ring (ClosingFx and CSS).
 */
export function ClosingBlack({ blocks, settings }: { blocks: Blocks; settings: Settings }) {
  return (
    <ClosingFx className="hbc relative overflow-hidden px-3 md:px-[48px]" labelledBy="hb-closing-heading">
      <Rings />
      <div className="relative max-w-layout mx-auto flex flex-col items-center text-center">
        <Heading text={t(blocks, "home.cta.heading")} />
        <p className="hb-sub mt-4 text-body-l max-w-[56ch] mx-auto" data-reveal="up">
          {t(blocks, "home.cta.sub")}
        </p>
        <div className="mt-5 flex flex-col items-center gap-3" data-reveal="up">
          <div className="hbc-cta">
            <span className="hbc-sonar" aria-hidden="true"><i /><i /><i /></span>
            <Magnetic strength={0.25}>
              <ArrowFillButton label={blocks["home.cta.button"] ?? t(blocks, "home.hero.cta")} href="/#contact" />
            </Magnetic>
          </div>
          <p className="hb-sub text-body m-0">
            {t(blocks, "home.cta.secondary")}{" "}
            <HbLink href={`mailto:${settings.email}`} className="hb-link--inline" arrow={false}>
              {settings.email}
            </HbLink>
          </p>
        </div>
      </div>
    </ClosingFx>
  );
}

export default ClosingBlack;
