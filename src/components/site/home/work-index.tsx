import { Button, SectionMarker } from "@/components/ui";
import { ProjectShowcase, type ShowcaseProject } from "@/components/site/home/project-showcase";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";

type WorkIndexProps = { blocks: Blocks; projects: IndexProject[]; total: number };

/**
 * The homepage work section on the matte ground (the hero's tone and grain,
 * no threads). Marker and count in the rail, the hover showcase in the
 * column, the all-work button below.
 */
export function WorkIndex({ blocks, projects, total }: WorkIndexProps) {
  const items: ShowcaseProject[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    year: p.year,
    cover: p.cover ? { ...imageSrcSet(p.cover.keyPrefix, p.cover.variants), blurDataUrl: p.cover.blurDataUrl } : null,
  }));

  return (
    <section id="work" className="section-dark ground-matte on-dark relative overflow-hidden px-3 md:px-[48px] pt-5 pb-6">
      <div className="relative z-10 max-w-layout mx-auto flex flex-col gap-3">
        <aside>
          <SectionMarker surface="dark" count={total} as="h2">{t(blocks, "home.work.marker")}</SectionMarker>
        </aside>
        <div className="min-w-0">
          <ProjectShowcase projects={items} />
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
