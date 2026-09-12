import { Button, MediaFrame, SectionMarker } from "@/components/ui";
import { ProjectRows } from "@/components/site/project-rows";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";

type WorkIndexProps = { blocks: Blocks; projects: IndexProject[]; total: number };

/**
 * The homepage work section. Dark. Hover or focus a row: the lime cursor
 * draws down, the background steps, and its thumbnail appears in the rail
 * (CSS :has, no JavaScript).
 */
export function WorkIndex({ blocks, projects, total }: WorkIndexProps) {
  return (
    <section id="work" className="section-dark on-dark px-3 md:px-[48px] pt-5 pb-6">
      <div className="work-index max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
        <aside className="lg:sticky lg:top-3 lg:self-start">
          <SectionMarker surface="dark" count={total} as="h2">{t(blocks, "home.work.marker")}</SectionMarker>
          <div className="relative mt-3 hidden lg:block" aria-hidden="true">
            {projects.map((p) => (
              <div key={p.id} className="work-thumb absolute inset-x-0 top-0" style={p.cover ? ({ viewTransitionName: `cover-${p.slug}` } as React.CSSProperties) : undefined}>
                {p.cover ? (
                  <MediaFrame surface="dark" width={p.cover.width ?? 16} height={p.cover.height ?? 10} blurDataUrl={p.cover.blurDataUrl ?? undefined}>
                    <img {...imageSrcSet(p.cover.keyPrefix, p.cover.variants)} sizes="180px" alt="" width={p.cover.width ?? 16} height={p.cover.height ?? 10} loading="lazy" decoding="async" />
                  </MediaFrame>
                ) : null}
              </div>
            ))}
          </div>
        </aside>
        <div className="min-w-0">
          <ProjectRows blocks={blocks} projects={projects} surface="dark" revealFirst />
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
