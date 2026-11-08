import { Section } from "@/components/ui";
import { Magnetic } from "@/components/motion/magnetic";
import { Split, vars } from "@/components/motion/split";
import { CtaButton } from "@/components/site/cta-button";

/**
 * The dark band that closes a page: one heading, one line, the main action and
 * a quieter second one. The hexagon outline turns slowly behind it (CSS, still
 * under reduced motion). Server component.
 */
export function ClosingBand({ heading, sub, cta, secondary }: { heading: string; sub: string; cta: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <Section tone="dark" pad="none" className="sv-close py-6 md:py-7" innerClassName="relative">
      <svg className="sv-close-hex" viewBox="0 0 200 220" fill="none" aria-hidden="true" focusable="false">
        <path d="M100 6l88 51v106l-88 51-88-51V57z" />
        <path d="M100 46l53 31v66l-53 31-53-31V77z" />
      </svg>
      <div className="relative max-w-[880px]">
        <Split as="h2" text={heading} className="text-display-l" />
        <p className="mt-3 text-body-l max-w-[56ch]" data-reveal="up" style={vars({ "--d": 160 })}>{sub}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" data-reveal="up" style={vars({ "--d": 260 })}>
          <Magnetic>
            <CtaButton href={cta.href}>{cta.label}</CtaButton>
          </Magnetic>
          {secondary ? <CtaButton href={secondary.href} variant="ghost">{secondary.label}</CtaButton> : null}
        </div>
      </div>
    </Section>
  );
}
