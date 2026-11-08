import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { cx } from "@/lib/cx";

/**
 * Results as a bento (owner-supplied design, 2026-09-14, rebuilt on our
 * tokens). The first metric is the lead: a lime card, two rows tall, with a
 * hatched corner. The rest fill the right half as raised cards, sized by
 * rule from the count so the grid always closes:
 *   1 metric   -> the lead alone, full width
 *   2          -> lead + one tall card
 *   3          -> lead + two stacked cards
 *   4          -> lead + one wide card on top, two small below
 *   5+         -> lead + wide card, then the rest in a row of small cards
 * On a concept every figure carries a "target" tag, so nobody reads a design
 * goal as a measured result. Server component; data from ProjectMetric.
 */

export type Metric = { label: string; value: string; note: string | null; period: string | null; source: string | null };

function provenance(m: Metric, blocks: Blocks, target: string | null): string | null {
  // The target tag already says it; "target" again in the period is noise.
  const period = target && m.period?.trim().toLowerCase() === target.toLowerCase() ? null : m.period;
  const how = [period, m.source ? `${t(blocks, "case.metricMeasured")} ${m.source}` : null].filter(Boolean).join(", ");
  return how || null;
}

export function ResultsBento({ metrics, blocks, target = null }: { metrics: Metric[]; blocks: Blocks; target?: string | null }) {
  if (metrics.length === 0) return null;
  const [lead, ...rest] = metrics;
  const n = rest.length;

  const Tag = ({ dark = false }: { dark?: boolean }) =>
    target ? <span className={cx("inline-flex items-center h-[24px] px-1 rounded-full text-small font-medium border", dark ? "border-ink/30 text-ink" : "border-divider-light bg-bone text-ink")}>{target}</span> : null;

  const Lead = (
    <div className={cx("relative overflow-hidden rounded-[24px] bg-lime text-ink p-3 md:p-4 flex flex-col justify-between min-h-[200px]", n === 0 ? "md:col-span-6" : "md:col-span-3 md:row-span-2")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-25 [background:repeating-linear-gradient(45deg,var(--color-ink)_0_1px,transparent_1px_10px)] [mask-image:radial-gradient(ellipse_80%_55%_at_100%_0%,black_60%,transparent_100%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-block px-2 py-[2px] rounded-full bg-ink/10 text-small font-medium text-ink">{lead.label}</span>
          <Tag dark />
        </div>
        <p className="mt-4 font-mono text-display-l tracking-[-0.03em] leading-none text-ink max-w-none tabular-nums">{lead.value}</p>
      </div>
      <div className="relative mt-3">
        {lead.note ? <p className="text-small text-ink max-w-[36ch]">{lead.note}</p> : null}
        {provenance(lead, blocks, target) ? <p className="data text-ink max-w-none mt-1">{provenance(lead, blocks, target)}</p> : null}
      </div>
    </div>
  );

  const Card = ({ m, className }: { m: Metric; className?: string }) => (
    <div className={cx("cl-spot relative rounded-[24px] bg-paper border border-divider-light p-3 flex flex-col justify-center min-h-[96px]", className)}>
      {target ? <div className="mb-2"><Tag /></div> : null}
      <p className="font-mono text-h2 text-ink max-w-none tabular-nums leading-none">{m.value}</p>
      <p className="mt-1 text-small text-ink max-w-none">{m.label}</p>
      {m.note ? <p className="mt-[4px] text-small text-ash max-w-none">{m.note}</p> : null}
      {provenance(m, blocks, target) ? <p className="data text-ash max-w-none mt-1">{provenance(m, blocks, target)}</p> : null}
    </div>
  );

  let right: React.ReactNode = null;
  if (n === 1) right = <Card m={rest[0]} className="md:col-span-3 md:row-span-2" />;
  else if (n === 2) right = <>{rest.map((m, i) => <Card key={i} m={m} className="md:col-span-3" />)}</>;
  else if (n === 3) right = <><Card m={rest[0]} className="md:col-span-3" /><Card m={rest[1]} className="md:col-span-1 text-center [&>p]:max-w-none" /><Card m={rest[2]} className="md:col-span-2" /></>;
  else right = (
    <>
      <Card m={rest[0]} className="md:col-span-3" />
      <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-2">
        {rest.slice(1).map((m, i) => <Card key={i} m={m} />)}
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-[auto_auto] gap-2">
      {Lead}
      {right}
    </div>
  );
}
