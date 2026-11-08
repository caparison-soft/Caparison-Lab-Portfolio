import type { Metadata } from "next";
import Link from "next/link";
import { Split, vars } from "@/components/motion/split";
import { CtaButton } from "@/components/site/cta-button";
import { WorkCard } from "@/components/site/work-card";
import { getBlocks, t } from "@/lib/queries/content";
import { getProjectIndex, getWorkFilters, type ProjectKind } from "@/lib/queries/work";
import { Starfield } from "@/components/site/home/black/starfield";

type SearchParams = Promise<{ kind?: string; type?: string; stack?: string }>;

/** URL value to Project.kind, in the order the filters show. */
const KINDS: { slug: string; kind: ProjectKind; key: string }[] = [
  { slug: "product", kind: "INTERNAL", key: "work.filters.kind.internal" },
  { slug: "concept", kind: "CONCEPT", key: "work.filters.kind.concept" },
  { slug: "client", kind: "CLIENT", key: "work.filters.kind.client" },
];

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["Work", "Navigation"]);
  return { title: t(blocks, "nav.work"), description: t(blocks, "work.index.sub") };
}

function href(q: { kind?: string; type?: string; stack?: string }): string {
  const s = new URLSearchParams();
  if (q.kind) s.set("kind", q.kind);
  if (q.type) s.set("type", q.type);
  if (q.stack) s.set("stack", q.stack);
  const str = s.toString();
  return str ? `/work?${str}` : "/work";
}

/**
 * The work index. Filter state lives in the URL so every view is a link:
 * shareable, back-button friendly, and rendered on the server. Kind first
 * (our products, concepts, client projects), then the project type.
 */
export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [blocks, filters] = await Promise.all([getBlocks(["Work", "Navigation"]), getWorkFilters()]);
  // Unknown filter values are ignored, not treated as "no results".
  const kind = KINDS.find((k) => k.slug === sp.kind && filters.kinds[k.kind] > 0);
  const type = filters.categories.some((c) => c.slug === sp.type) ? sp.type : undefined;
  const stack = filters.stack.some((s) => s.slug === sp.stack) ? sp.stack : undefined;
  const projects = await getProjectIndex({ kind: kind?.kind, category: type, stack });
  const total = filters.kinds.CLIENT + filters.kinds.INTERNAL + filters.kinds.CONCEPT;
  const visibleKinds = KINDS.filter((k) => filters.kinds[k.kind] > 0);
  const filtered = Boolean(kind || type || stack);

  return (
    <main id="main" className="theme-dark">
      <Starfield />
      <section className="wk-top px-3 md:px-[48px] pb-5">
        <div className="max-w-layout mx-auto">
          <p className="cl-kicker" data-reveal="up">{t(blocks, "work.index.kicker")}</p>
          <Split as="h1" text={t(blocks, "work.index.heading")} className="mt-2 text-mega max-w-[16ch]" />
          <p className="mt-3 text-body-l text-ash max-w-[56ch]" data-reveal="up" style={vars({ "--d": 200 })}>{t(blocks, "work.index.sub")}</p>
        </div>
      </section>

      <section className="px-3 md:px-[48px] pb-5">
        <div className="max-w-layout mx-auto">
          <hr className="cl-rule" data-reveal="line" />
          <nav aria-label={t(blocks, "work.filters.kindLabel")} className="mt-3 flex flex-col gap-2" data-reveal="fade">
            {visibleKinds.length > 1 ? (
              <ul className="wk-filters">
                <li>
                  <Link href={href({ type, stack })} className="wk-filter" aria-current={!kind ? "page" : undefined} scroll={false}>
                    {t(blocks, "work.filters.allLabel")} <span className="wk-filter-count">{total}</span>
                  </Link>
                </li>
                {visibleKinds.map((k) => (
                  <li key={k.slug}>
                    <Link href={href({ kind: k.slug, type, stack })} className="wk-filter" aria-current={kind?.slug === k.slug ? "page" : undefined} scroll={false}>
                      {t(blocks, k.key)} <span className="wk-filter-count">{filters.kinds[k.kind]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {filters.categories.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-small text-ash max-w-none mr-1">{t(blocks, "work.filters.categoryLabel")}</p>
                <ul className="wk-filters">
                  {filters.categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={href({ kind: kind?.slug, type: type === c.slug ? undefined : c.slug, stack })}
                        className="wk-filter wk-filter--sm"
                        aria-current={type === c.slug ? "page" : undefined}
                        scroll={false}
                      >
                        {c.name} <span className="wk-filter-count">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {filtered ? <Link href="/work" className="cl-link cl-link--always text-small text-ink ml-1" scroll={false}>{t(blocks, "work.filters.clearLabel")}</Link> : null}
              </div>
            ) : null}
          </nav>
        </div>
      </section>

      <section className="px-3 md:px-[48px] pb-6 lg:pb-7">
        <div className="max-w-layout mx-auto">
          {projects.length === 0 ? (
            <p className="py-5 text-body-l text-ash max-w-none">{t(blocks, "work.index.emptyState")}</p>
          ) : (
            <ul className="wk-grid">
              {projects.map((p, i) => (
                <li key={p.id}>
                  <WorkCard p={p} blocks={blocks} index={i} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="px-3 md:px-[48px] pb-6 lg:pb-7">
        <div className="max-w-layout mx-auto">
          <div className="wk-band on-dark" data-reveal="up">
            <span className="wk-band-hex" aria-hidden="true" />
            <div className="relative max-w-[640px]">
              <h2 className="text-display-l text-bone">{t(blocks, "work.index.ctaHeading")}</h2>
              <p className="mt-2 text-body-l text-sage max-w-[52ch]">{t(blocks, "work.index.ctaSub")}</p>
              <div className="mt-4">
                <CtaButton href="/contact?type=review">{t(blocks, "work.index.ctaButton")}</CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
