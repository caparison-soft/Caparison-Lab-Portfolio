import Link from "next/link";
import { Button, DataLine, MediaFrame, SectionMarker, TagList } from "@/components/ui";
import { RichText } from "@/components/site/rich-text";
import { CaseCover } from "@/components/site/case-cover";
import { GalleryCarousel } from "@/components/site/gallery-carousel";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CaseStudy, MediaItem } from "@/lib/queries/work";
import { formatBudget, formatDuration } from "@/lib/format";
import { posterSrc, videoSrc } from "@/lib/media";
import { cx } from "@/lib/cx";

function VideoItem({ m }: { m: MediaItem }) {
  return (
    <figure className="m-0">
      <MediaFrame width={m.width ?? 16} height={m.height ?? 9}>
        <video controls preload="metadata" playsInline poster={posterSrc(m.posterKey, m.keyPrefix)} width={m.width ?? 16} height={m.height ?? 9} aria-label={m.alt ?? m.title ?? undefined}>
          <source src={videoSrc(m.keyPrefix)} type="video/mp4" />
        </video>
      </MediaFrame>
      {m.title || m.caption ? (
        <figcaption className="mt-1">
          {m.title ? <p className="text-body font-medium text-ink max-w-none">{m.title}</p> : null}
          {m.caption ? <p className="text-small text-ash max-w-[60ch]">{m.caption}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

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

            {p.hero || (p.videoUrl && p.videoProvider !== "R2") ? (
              <div className="mt-4">
                <CaseCover slug={p.slug} hero={p.hero} videoUrl={p.videoUrl} videoProvider={p.videoProvider} title={p.title} />
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
                <GalleryCarousel items={p.media} labels={{ slide: t(blocks, "case.carouselSlide") }} />
              </section>
            ) : null}

            {p.videos.length > 0 ? (
              <section className="mt-5" aria-labelledby="videos-heading">
                <SectionMarker as="h2" id="videos-heading" className="border-t border-divider-light pt-2 mb-3">{t(blocks, "case.videosHeading")}</SectionMarker>
                <div className="flex flex-col gap-3">
                  {p.videos.map((m) => <VideoItem key={m.id} m={m} />)}
                </div>
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
