import Link from "next/link";
import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split, vars } from "@/components/motion/split";

/**
 * Home on black: the three monthly partner packages (owner, 2026-11-07).
 * Equal cards, no recommended one. Each reads top to bottom: package number,
 * name, the price large, who it is for, the button, then what is included and
 * the small print. Hover lights the card's top-left corner, after the owner's
 * reference. Every string is a block. Server component. The section is the
 * header's "Pricing" link target (#pricing).
 */
export function PricingBlack({ blocks }: { blocks: Blocks }) {
  const packs = ["1", "2", "3"].map((n) => ({
    n,
    label: t(blocks, `home.pricing.p${n}.label`),
    name: t(blocks, `home.pricing.p${n}.name`),
    price: t(blocks, `home.pricing.p${n}.price`),
    who: t(blocks, `home.pricing.p${n}.for`),
    items: lines(t(blocks, `home.pricing.p${n}.items`)),
    note: t(blocks, `home.pricing.p${n}.note`),
  }));
  const period = t(blocks, "home.pricing.period");
  const cta = t(blocks, "home.pricing.cta");
  const included = t(blocks, "home.pricing.included");

  return (
    <section id="pricing" className="px-3 md:px-[48px] py-5 lg:py-[72px] scroll-mt-[80px]" aria-labelledby="hb-pricing-heading">
      <div className="max-w-layout mx-auto">
        <div className="text-center">
          <Split as="h2" id="hb-pricing-heading" text={t(blocks, "home.pricing.heading")} className="hb-h2 mx-auto max-w-[18ch]" />
          <p className="hb-sub mt-2 text-body max-w-[52ch] mx-auto" data-reveal="up">{t(blocks, "home.pricing.sub")}</p>
        </div>
        <ul className="pr-grid">
          {packs.map((p, i) => (
            <li key={p.n} className="pr-card" data-reveal="up" style={vars({ "--d": i * 110 })}>
              <p className="pr-label">{p.label}</p>
              <h3 className="pr-name">{p.name}</h3>
              <p className="pr-price">
                <span className="pr-figure">{p.price}</span>
                <span className="pr-period">{period}</span>
              </p>
              <p className="pr-who">{p.who}</p>
              <Link href="/#contact" className="pr-btn">
                <span>{cta}</span>
                <span className="pr-btn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </Link>
              <p className="pr-inc">{included}</p>
              <ul className="pr-items">
                {p.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
              <p className="pr-note">{p.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
