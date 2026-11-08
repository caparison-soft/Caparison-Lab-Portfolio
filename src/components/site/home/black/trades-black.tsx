import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split } from "@/components/motion/split";
import { TradesBlackPicker } from "./trades-black-picker";

/** Parses home.industry.trades: one "Name | example" per line. */
function parseTrades(value: string) {
  return lines(value)
    .map((l) => {
      const [name = "", example = ""] = l.split("|").map((s) => s.trim());
      return { name, example };
    })
    .filter((tr) => tr.name);
}

/** Home on black: "Built for home service businesses", a trade picker. */
export function TradesBlack({ blocks }: { blocks: Blocks }) {
  const trades = parseTrades(t(blocks, "home.industry.trades"));
  if (trades.length === 0) return null;
  return (
    <section className="px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-trades-heading">
      <div className="max-w-layout mx-auto">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)] lg:items-end">
          <div>
            <p className="hb-kicker" data-reveal="up">{t(blocks, "home.industry.kicker")}</p>
            <Split as="h2" id="hb-trades-heading" text={t(blocks, "home.industry.heading")} className="hb-h2 mt-3 max-w-[14ch]" />
          </div>
          <p className="hb-sub text-body-l max-w-[40ch]" data-reveal="up">{t(blocks, "home.industry.sub")}</p>
        </div>
        <div className="mt-5" data-reveal="up">
          <TradesBlackPicker trades={trades} cta={t(blocks, "home.industry.cta")} labelledBy="hb-trades-heading" />
        </div>
      </div>
    </section>
  );
}

export default TradesBlack;
