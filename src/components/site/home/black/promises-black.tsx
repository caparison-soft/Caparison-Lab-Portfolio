import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split, vars } from "@/components/motion/split";
import { CountUp } from "@/components/motion/count-up";

/**
 * Splits "30 days" into the figure that counts ("30") and a word unit set
 * smaller beside it ("days"). Symbols that belong to the number ("100%",
 * "$500") stay in the figure.
 */
function splitFigure(value: string): { figure: string; unit: string } {
  const m = value.match(/^(\D*[\d,.]+\S*)\s+(.+)$/);
  return m ? { figure: m[1], unit: m[2] } : { figure: value, unit: "" };
}

/** Home on black: what we put in writing. Big figures that count up once, with what each one means. */
export function PromisesBlack({ blocks }: { blocks: Blocks }) {
  const items = lines(t(blocks, "home.promises.items"))
    .map((l) => {
      const [value = "", label = ""] = l.split("|").map((s) => s.trim());
      return { value, label };
    })
    .filter((it) => it.value);
  if (items.length === 0) return null;
  return (
    <section className="px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-promises-heading">
      <div className="max-w-layout mx-auto">
        {/* Centred, no label above it (owner, 2026-11-07). */}
        <Split as="h2" id="hb-promises-heading" text={t(blocks, "home.promises.heading")} className="hb-h2 text-center mx-auto max-w-[20ch]" />
        <dl className="hbm-grid mt-5 m-0" data-count={items.length}>
          {items.map((it, i) => {
            const { figure, unit } = splitFigure(it.value);
            return (
              <div key={it.value + it.label} className="hbm-card" data-reveal="up" style={vars({ "--d": i * 90 })}>
                <dt className="sr-only">{it.label}</dt>
                <dd className="m-0 flex flex-col">
                  <span className="hbm-figure">
                    <CountUp value={figure} className="hbm-value" />
                    {unit ? <span className="hbm-unit">{unit}</span> : null}
                  </span>
                  <span className="hb-sub mt-2 text-body" aria-hidden="true">
                    {it.label}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

export default PromisesBlack;
