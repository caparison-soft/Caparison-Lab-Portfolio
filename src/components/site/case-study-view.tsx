import Link from "next/link";
import { Button, DataLine, MediaFrame, SectionMarker, TagList } from "@/components/ui";
import { RichText } from "@/components/site/rich-text";
import { CaseCover } from "@/components/site/case-cover";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CaseStudy, MediaItem } from "@/lib/queries/work";
import { formatBudget, formatDuration } from "@/lib/format";
import { imageSrcSet, posterSrc, videoSrc } from "@/lib/media";
import { cx } from "@/lib/cx";

function GalleryItem({ m, sizes }: { m: MediaItem; sizes: string }) {
  if (m.type === "VIDEO") {
    return (
      <figure className="m-0">
        <MediaFrame width={m.width ?? 16} height={m.height ?? 9}>
          <video controls preload="metadata" playsInline poster={posterSrc(m.posterKey, m.keyPrefix)} width={m.width ?? 16} height={m.height ?? 9}>
            <source src={videoSrc(m.keyPrefix)} type="video/mp4" />
          </video>
        </MediaFrame>
        {m.caption ? <figcaption className="mt-1 text-small text-ash">{m.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <figure className="m-0">
      <MediaFrame width={m.width ?? 16} height={m.height ?? 10} blurDataUrl={m.blurDataUrl ?? undefined}>
        <img {...imageSrcSet(m.keyPrefix, m.variants)} sizes={sizes} alt={m.alt ?? ""} width={m.width ?? 16} height={m.height ?? 10} loading="lazy" decoding="async" />
      </MediaFrame>
      {m.caption ? <figcaption className="mt-1 text-small text-ash">{m.caption}</figcaption> : null}
    </figure>
  );
}

/**
 * Gallery: first item full width, then pairs alternating 2:1 and 1:2.
 * Mixed sizes by rule, not by hand.
 */
function Gallery({ items }: { items: MediaItem[] }) {
  const [first, ...rest] = items;
  const pairs: MediaItem[][] = [];
  for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i + 2));
  return (
    <div className="flex flex-col gap-2">
      {first ? <GalleryItem m={first} sizes="(min-width: 1024px) 1000px, 100vw" /> : null}
      {pairs.map((pair, i) => (
        <div key={i} className={cx("grid gap-2 grid-cols-1 md:grid-cols-3")}>
          {pair.map((m, j) => {
            const wide = pair.length === 2 && ((i % 2 === 0 && j === 0) || (i % 2 === 1 && j === 1));
            return (
              <div key={m.id} className={cx(pair.length === 1 ? "md:col-span-3" : wide ? "md:col-span-2" : "md:col-span-1")}>
                <GalleryItem m={m} sizes={wide ? "(min-width: 1024px) 660px, 100vw" : "(min-width: 1024px) 330px, 100vw"} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The case study, shared by the public page and the signed draft preview. */
export function CaseStudyView({ p, blocks, preview = false }: { p: CaseStudy; blocks: Blocks; preview?: boolean }) {
  const budget = formatBudget(p);
  const duration = formatDuration(p, "long");
  const meta = [
    ...(p.clientName ? [{ label: t(blocks, "case.meta.client"), value: p.clientName }] : []),
    ...(budget ? [{ label: t(blocks, "case.meta.budget"), value: budget }] : []),
    ...(duration ? [{ label: t(blocks, "case.meta.duration"), value: duration }] : []),
    ...(p.year ? [{ label: t(blocks, "case.meta.year"), value: String(p.year) }] : []),
    ...(p.teamSize ? [{ label: t(blocks, "case.meta.team"), value: String(p.teamSize) }] : []),
  ];

  const ctaLabel = p.ctaLabel ?? t(blocks, "case.ctaDefaultLabel");

  return (
    <main id="main">
      {preview ? (
        <div className="section-dark on-dark px-3 md:px-[48px] py-1">
          <p className="max-w-layout mx-auto text-small text-bone max-w-none">Draft preview. Only people with this link can see it. Status: {p.status.toLowerCase()}.</p>
        </div>
      ) : null}
      <section className="px-3 md:px-[48px] pt-4 lg:pt-6 pb-6">
        <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
          {/* The spine becomes the metadata column. Sticky on desktop. */}
          <aside className="lg:sticky lg:top-3 lg:self-start flex flex-col gap-3">
            <Link href="/work" className="inline-flex items-center gap-1 text-body font-medium text-ash hover:text-ink no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
              {t(blocks, "case.backLabel")}
            </Link>
            <DataLine direction="stack" items={meta} className="hidden lg:flex" />
            {p.stack.length > 0 ? (
              <div className="hidden lg:block">
                <p className="text-small text-ash max-w-none mb-1">{t(blocks, "case.meta.stack")}</p>
                <TagList items={p.stack} />
              </div>
            ) : null}
            {p.liveUrl ? (
              <a href={p.liveUrl} rel="noopener noreferrer" target="_blank" className="hidden lg:inline-flex text-small font-medium text-cobalt">
                {t(blocks, "case.meta.liveLabel")}
              </a>
            ) : null}
          </aside>

          <article className="min-w-0">
            <header>
              {p.category ? <SectionMarker>{p.category.name.toLowerCase()}</SectionMarker> : null}
              <h1 className="mt-2 text-display-l">{p.title}</h1>
              <p className="mt-2 text-body-l text-ash max-w-[52ch]">{p.summary}</p>
            </header>

            {/* Mobile metadata: a two-column sheet between summary and cover. */}
            <div className="lg:hidden mt-3 border-t border-divider-light pt-2">
              <DataLine items={meta} />
              {p.stack.length > 0 ? <TagList className="mt-2" items={p.stack} /> : null}
              {p.liveUrl ? (
                <a href={p.liveUrl} rel="noopener noreferrer" target="_blank" className="mt-2 inline-flex text-small font-medium text-cobalt">
                  {t(blocks, "case.meta.liveLabel")}
                </a>
              ) : null}
            </div>

            {p.cover || p.videoUrl ? (
              <div className="mt-4">
                <CaseCover slug={p.slug} cover={p.cover} videoUrl={p.videoUrl} videoProvider={p.videoProvider} title={p.title} />
              </div>
            ) : null}

            <div className="mt-5 max-w-[720px]">
              <RichText content={p.body} />
            </div>

            {p.metrics.length > 0 ? (
              <section className="mt-5" aria-labelledby="metrics-heading">
                <SectionMarker as="h2" id="metrics-heading" className="border-t border-divider-light pt-2">{t(blocks, "case.metricsHeading")}</SectionMarker>
                <div className={cx("sheet mt-3 grid-cols-1", p.metrics.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
                  {p.metrics.map((m, i) => (
                    <div key={i} className="p-3 bg-bone">
                      <p className="font-mono text-h3 text-ink max-w-none tabular-nums">{m.value}</p>
                      <p className="text-body text-ink max-w-none mt-1">{m.label}</p>
                      {m.note ? <p className="text-small text-ash max-w-none mt-[4px]">{m.note}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {p.media.length > 0 ? (
              <section className="mt-5" aria-labelledby="gallery-heading">
                <SectionMarker as="h2" id="gallery-heading" className="border-t border-divider-light pt-2 mb-3">{t(blocks, "case.galleryHeading")}</SectionMarker>
                <Gallery items={p.media} />
              </section>
            ) : null}

            {p.ctaMode !== "NONE" ? (
              <aside className="mt-6 bg-paper border border-divider-light rounded-lg p-3 md:p-4 md:flex md:items-end md:justify-between md:gap-4">
                <div>
                  <p className="text-h3 font-bold text-ink max-w-none">{t(blocks, "case.ctaHeading")}</p>
                  {p.ctaNote ? <p className="mt-1 text-body text-ash max-w-[48ch]">{p.ctaNote}</p> : null}
                </div>
                <div className="mt-3 md:mt-0 flex-none">
                  {p.ctaMode === "ENQUIRY" ? (
                    <Button href={`/contact?project=${encodeURIComponent(p.slug)}`}>{ctaLabel}</Button>
                  ) : p.ctaHref ? (
                    <Button href={p.ctaHref} rel="noopener noreferrer" target="_blank">{ctaLabel}</Button>
                  ) : null}
                </div>
              </aside>
            ) : null}

            {p.next ? (
              <nav className="mt-5 border-t border-divider-light pt-3" aria-label="Next project">
                <SectionMarker as="p">{t(blocks, "case.nextLabel")}</SectionMarker>
                <Link href={`/work/${p.next.slug}`} className="mt-1 inline-block text-h3 font-bold text-ink no-underline hover:text-ash transition-colors dur-fast">
                  {p.next.title}
                </Link>
              </nav>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
