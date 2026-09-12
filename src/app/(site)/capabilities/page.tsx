import type { Metadata } from "next";
import { Button, DataLine, Section, SectionMarker, Spine, SpineIndex } from "@/components/ui";
import { getBlocks, t } from "@/lib/queries/content";
import { getCapabilities } from "@/lib/queries/home";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["Capabilities"]);
  return { title: t(blocks, "capabilities.heading"), description: t(blocks, "capabilities.sub") };
}

/** One index page for all capabilities, with anchors. Decided in Phase 0. */
export default async function CapabilitiesPage() {
  const [blocks, items] = await Promise.all([getBlocks(["Capabilities", "Homepage"]), getCapabilities()]);
  return (
    <main id="main">
      <Section pad="tall" className="pb-4">
        <Spine sticky={false} rail={<SectionMarker count={items.length}>{t(blocks, "home.capabilities.marker")}</SectionMarker>}>
          <h1 className="text-display-l">{t(blocks, "capabilities.heading")}</h1>
          <p className="mt-2 text-body-l text-ash max-w-[52ch]">{t(blocks, "capabilities.sub")}</p>
        </Spine>
      </Section>
      <Section pad="none" className="pb-6">
        <Spine rail={<SpineIndex items={items.map((c) => ({ href: `#${c.slug}`, label: c.title.toLowerCase() }))} />}>
          <div className="border-t border-divider-light">
            {items.map((c) => (
              <article key={c.slug} id={c.slug} className="py-4 border-b border-divider-light grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-3 scroll-mt-3">
                <div>
                  <h2>{c.title}</h2>
                  <p className="mt-2 text-body-l text-ash max-w-[44ch]">{c.blurb}</p>
                  <DataLine
                    className="mt-3"
                    items={[
                      ...(c.startingPrice ? [{ value: c.startingPrice }] : []),
                      ...(c.typicalTimeline ? [{ value: c.typicalTimeline }] : []),
                    ]}
                  />
                </div>
                <div>
                  {c.deliverables.length > 0 ? (
                    <>
                      <p className="text-small text-ash max-w-none">{t(blocks, "capabilities.deliverablesLabel")}</p>
                      <ul className="mt-1 list-none m-0 p-0 flex flex-col gap-1 border-t border-divider-light pt-2">
                        {c.deliverables.map((d) => (
                          <li key={d} className="text-body text-ink flex gap-1">
                            <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-olive-400 flex-none mt-[9px]" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4">
            <Button href="/contact">{t(blocks, "home.hero.ctaPrimary")}</Button>
          </div>
        </Spine>
      </Section>
    </main>
  );
}
