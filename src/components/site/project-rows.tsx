import { TransitionLink } from "@/components/site/view-transitions";
import { StackLogos } from "@/components/site/stack-logos";
import { RevealRow } from "@/components/site/reveal-row";
import { cx } from "@/lib/cx";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { formatBudget, formatDuration } from "@/lib/format";
import type { Surface } from "@/components/ui";

type ProjectRowsProps = {
  blocks: Blocks;
  projects: IndexProject[];
  surface?: Surface;
  /** The homepage uses the single scroll reveal on its first row. Nowhere else. */
  revealFirst?: boolean;
  emptyState?: string;
};

export const rowCols = "grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,160px)_minmax(0,110px)_minmax(0,70px)] gap-x-3";

/**
 * The index rows: column headers, hairline-divided rows, budget and duration
 * in mono. Shared by the homepage work section and /work.
 */
export function ProjectRows({ blocks, projects, surface = "dark", revealFirst = false, emptyState }: ProjectRowsProps) {
  const dark = surface === "dark";
  const head = dark ? "text-sage" : "text-ash";
  const title = dark ? "text-bone" : "text-ink";
  const muted = dark ? "text-sage" : "text-ash";
  const line = dark ? "border-olive-600" : "border-divider-light";

  if (projects.length === 0 && emptyState) {
    return <p className={cx("py-4 text-body-l max-w-none", muted)}>{emptyState}</p>;
  }

  return (
    <>
      <div className={cx(rowCols, "hidden md:grid px-2 pb-1 text-small", head)} aria-hidden="true">
        <span>{t(blocks, "home.work.colProject")}</span>
        <span>{t(blocks, "home.work.colClient")}</span>
        <span>{t(blocks, "home.work.colBudget")}</span>
        <span>{t(blocks, "home.work.colDuration")}</span>
      </div>
      <ol className={cx("list-none m-0 p-0 border-t", line)}>
        {projects.map((p, i) => {
          const inner = (
            <TransitionLink href={`/work/${p.slug}`} className="block no-underline px-2 py-2 outline-offset-[-2px]">
              <div className={rowCols}>
                <span className={cx("col-span-2 md:col-span-1 text-h4 font-medium", title)}>{p.title}</span>
                <span className={cx("col-span-2 md:col-span-1 text-body", muted)}>{p.clientName}</span>
                <span className={cx("data", title)}>{formatBudget(p) ?? ""}</span>
                <span className={cx("data md:text-left text-right", title)}>{formatDuration(p) ?? ""}</span>
              </div>
              <p className={cx("mt-1 text-body max-w-[60ch]", muted)}>{p.summary}</p>
              <StackLogos className="mt-1" size={16} items={p.stack.slice(0, 6)} />
            </TransitionLink>
          );
          const cls = cx("work-row border-b", line, !dark && "work-row-light");
          return revealFirst && i === 0 ? (
            <RevealRow key={p.id} className={cls}>{inner}</RevealRow>
          ) : (
            <li key={p.id} className={cls}>{inner}</li>
          );
        })}
      </ol>
    </>
  );
}
