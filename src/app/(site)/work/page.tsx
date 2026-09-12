import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionMarker, Spine, Tag } from "@/components/ui";
import { ProjectRows } from "@/components/site/project-rows";
import { getBlocks, t } from "@/lib/queries/content";
import { getProjectIndex, getWorkFilters } from "@/lib/queries/work";

type SearchParams = Promise<{ type?: string; stack?: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["Work"]);
  return { title: t(blocks, "work.index.heading"), description: t(blocks, "work.index.sub") };
}

function href(type: string | undefined, stack: string | undefined): string {
  const q = new URLSearchParams();
  if (type) q.set("type", type);
  if (stack) q.set("stack", stack);
  const s = q.toString();
  return s ? `/work?${s}` : "/work";
}

/**
 * The full index. Filter state lives in the URL so every view is a link:
 * shareable, back-button friendly, and rendered on the server.
 */
export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const { type, stack } = await searchParams;
  const [blocks, filters] = await Promise.all([getBlocks(["Work", "Homepage"]), getWorkFilters()]);
  // Unknown filter values are ignored, not treated as "no results".
  const validType = filters.categories.some((c) => c.slug === type) ? type : undefined;
  const validStack = filters.stack.some((s) => s.slug === stack) ? stack : undefined;
  const projects = await getProjectIndex({ category: validType, stack: validStack });
  const filtered = Boolean(validType || validStack);

  return (
    <main id="main">
      <Section pad="tall" className="pb-4">
        <Spine
          sticky={false}
          rail={
            <div className="flex flex-col gap-1">
              <SectionMarker count={projects.length}>{t(blocks, "home.work.marker")}</SectionMarker>
            </div>
          }
        >
          <h1 className="text-display-l">{t(blocks, "work.index.heading")}</h1>
          <p className="mt-2 text-body-l text-ash max-w-[52ch]">{t(blocks, "work.index.sub")}</p>
        </Spine>
      </Section>

      <Section pad="none" className="pb-6">
        <Spine
          sticky={false}
          rail={
            <nav aria-label="Filters" className="flex flex-col gap-3">
              <div>
                <p className="text-small text-ash mb-1 max-w-none">{t(blocks, "work.filters.categoryLabel")}</p>
                <ul className="flex flex-wrap lg:flex-col gap-1 list-none m-0 p-0 items-start">
                  <li><Tag variant="filter" selected={!validType} href={href(undefined, validStack)}>{t(blocks, "work.filters.allLabel")}</Tag></li>
                  {filters.categories.map((c) => (
                    <li key={c.slug}>
                      <Tag variant="filter" selected={validType === c.slug} href={href(c.slug, validStack)}>{c.name}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-small text-ash mb-1 max-w-none">{t(blocks, "work.filters.stackLabel")}</p>
                <ul className="flex flex-wrap lg:flex-col gap-1 list-none m-0 p-0 items-start">
                  <li><Tag variant="filter" selected={!validStack} href={href(validType, undefined)}>{t(blocks, "work.filters.allLabel")}</Tag></li>
                  {filters.stack.map((s) => (
                    <li key={s.slug}>
                      <Tag variant="filter" selected={validStack === s.slug} href={href(validType, s.slug)}>{s.name}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
              {filtered ? (
                <Link href="/work" className="text-small font-medium text-ash hover:text-ink no-underline">{t(blocks, "work.filters.clearLabel")}</Link>
              ) : null}
            </nav>
          }
        >
          <ProjectRows blocks={blocks} projects={projects} surface="light" emptyState={t(blocks, "work.index.emptyState")} />
        </Spine>
      </Section>
    </main>
  );
}
