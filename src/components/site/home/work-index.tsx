import Link from "next/link";
import { Button, MediaFrame, SectionMarker, TagList } from "@/components/ui";
import { RevealRow } from "@/components/site/reveal-row";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { formatBudget, formatDuration } from "@/lib/format";

type WorkIndexProps = { blocks: Blocks; projects: IndexProject[]; total: number };

const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

/**
 * The work index. Dark. Full-width rows with column headers, not cards.
 * Hover or focus a row: the lime cursor draws down, the background steps,
 * and its thumbnail appears in the rail (CSS :has, no JavaScript).
 */
export function WorkIndex({ blocks, projects, total }: WorkIndexProps) {
  const cols = "grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,160px)_minmax(0,110px)_minmax(0,70px)] gap-x-3";
  return (
    <section id="work" className="section-dark on-dark px-3 md:px-[48px] pt-5 pb-6">
      <div className="work-index max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
        <aside className="lg:sticky lg:top-3 lg:self-start">
          <SectionMarker surface="dark" count={total} as="h2">{t(blocks, "home.work.marker")}</SectionMarker>
          {/* Thumbnail stack for the hovered row. Only projects with a cover contribute. */}
          <div className="relative mt-3 hidden lg:block" aria-hidden="true">
            {projects.map((p) => (
              <div key={p.id} className="work-thumb absolute inset-x-0 top-0">
                {p.cover ? (
                  <MediaFrame surface="dark" width={p.cover.width ?? 16} height={p.cover.height ?? 10} blurDataUrl={p.cover.blurDataUrl ?? undefined}>
                    <img
                      src={`${cdn}/${p.cover.keyPrefix}/w400.webp`}
                      srcSet={`${cdn}/${p.cover.keyPrefix}/w400.webp 400w, ${cdn}/${p.cover.keyPrefix}/w800.webp 800w`}
                      sizes="180px"
                      alt=""
                      width={p.cover.width ?? 16}
                      height={p.cover.height ?? 10}
                      loading="lazy"
                      decoding="async"
                    />
                  </MediaFrame>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className={`${cols} hidden md:grid px-2 pb-1 text-small text-sage`} aria-hidden="true">
            <span>{t(blocks, "home.work.colProject")}</span>
            <span>{t(blocks, "home.work.colClient")}</span>
            <span>{t(blocks, "home.work.colBudget")}</span>
            <span>{t(blocks, "home.work.colDuration")}</span>
          </div>
          <ol className="list-none m-0 p-0 border-t border-olive-600">
            {projects.map((p, i) => {
              const inner = (
                <Link href={`/work/${p.slug}`} className="block no-underline px-2 py-2 outline-offset-[-2px]">
                  <div className={cols}>
                    <span className="col-span-2 md:col-span-1 text-h4 font-medium text-bone">{p.title}</span>
                    <span className="col-span-2 md:col-span-1 text-body text-sage">{p.clientName}</span>
                    <span className="data text-bone">{formatBudget(p) ?? ""}</span>
                    <span className="data text-bone md:text-left text-right">{formatDuration(p) ?? ""}</span>
                  </div>
                  <p className="mt-1 text-body text-sage max-w-[60ch]">{p.summary}</p>
                  <TagList className="mt-1" surface="dark" items={p.stack.slice(0, 5)} />
                </Link>
              );
              const cls = "work-row border-b border-olive-600";
              return i === 0 ? (
                <RevealRow key={p.id} className={cls}>{inner}</RevealRow>
              ) : (
                <li key={p.id} className={cls}>{inner}</li>
              );
            })}
          </ol>
          <div className="mt-3">
            <Button href="/work" variant="secondary" surface="dark">
              {t(blocks, "home.work.viewAllLabel")} ({total})
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
