import Link from "next/link";
import { Button, MediaFrame, SectionMarker } from "@/components/ui";
import { StackMark } from "@/components/site/stack-logos";
import { InfiniteSlider } from "@/components/site/infinite-slider";
import { CaseCover } from "@/components/site/case-cover";
import { GalleryCarousel } from "@/components/site/gallery-carousel";
import { VideoPlayer } from "@/components/site/video-player";
import { CaseStory } from "@/components/site/case-story";
import { ResultsBento } from "@/components/site/results-bento";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CaseStudy, MediaItem } from "@/lib/queries/work";
import { currencySymbol, formatBudget, formatDuration } from "@/lib/format";
import { CaseHeader, type Fact } from "@/components/site/case-header";
import { posterSrc, videoSrc } from "@/lib/media";

function VideoItem({ m }: { m: MediaItem }) {
  return (
    <figure className="m-0">
      <MediaFrame width={m.width ?? 16} height={m.height ?? 9}>
        <VideoPlayer src={videoSrc(m.keyPrefix)} poster={posterSrc(m.posterKey, m.keyPrefix)} label={m.alt ?? m.title ?? undefined} width={m.width ?? 16} height={m.height ?? 9} />
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
  const stageLabel = p.stage ? t(blocks, `case.stage.${p.stage.toLowerCase()}`) : null;
  const unitLong = { DAYS: "days", WEEKS: "weeks", MONTHS: "months" } as const;
  const facts: Fact[] = [
    ...(budget ? [p.budgetDisplay || p.budgetMin == null
      ? { kind: "money" as const, label: t(blocks, "case.meta.budget"), symbol: "", min: 0, max: null, display: budget }
      : { kind: "money" as const, label: t(blocks, "case.meta.budget"), symbol: currencySymbol(p.budgetCurrency), min: p.budgetMin, max: p.budgetMax }] : []),
    ...(duration ? [p.durationDisplay || p.durationValue == null
      ? { kind: "count" as const, label: t(blocks, "case.meta.duration"), value: 0, display: duration }
      : { kind: "count" as const, label: t(blocks, "case.meta.duration"), value: p.durationValue, unit: p.durationValue === 1 ? unitLong[p.durationUnit].slice(0, -1) : unitLong[p.durationUnit] }] : []),
    ...(p.launchedAt ? [{ kind: "date" as const, label: t(blocks, "case.meta.launched"), iso: p.launchedAt }] : p.year ? [{ kind: "count" as const, label: t(blocks, "case.meta.year"), value: p.year, display: String(p.year) }] : []),
    ...(stageLabel ? [{ kind: "text" as const, label: t(blocks, "case.meta.stage"), value: stageLabel, dot: p.stage === "LIVE" }] : []),
    ...(p.teamSize ? [{ kind: "count" as const, label: t(blocks, "case.meta.team"), value: p.teamSize }] : []),
  ];

  const ctaLabel = p.ctaLabel ?? t(blocks, "case.ctaDefaultLabel");

  return (
    <main id="main">
      {preview ? (
        <div className="section-dark on-dark px-3 md:px-[48px] py-1">
          <p className="max-w-layout mx-auto text-small text-bone max-w-none">Draft preview. Only people with this link can see it. Status: {p.status.toLowerCase()}.</p>
        </div>
      ) : null}
      <section className="px-3 md:px-[48px] pt-[80px] lg:pt-6 pb-6">
        <div className="max-w-layout mx-auto">
          <article className="min-w-0">
            <Link href="/work" className="inline-flex items-center gap-1 text-body font-medium text-ash hover:text-ink no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
              {t(blocks, "case.backLabel")}
            </Link>
            <div className="mt-3">
              <CaseHeader
                category={p.category ? p.category.name.toLowerCase() : null}
                title={p.title}
                summary={p.summary}
                outcome={p.outcome}
                client={{ name: p.clientName, logoUrl: p.clientLogoUrl }}
                pills={[...(p.role ? p.role.split(",").map((r) => r.trim()).filter(Boolean) : []), ...p.platforms]}
                facts={facts}
                live={p.liveUrl ? { href: p.liveUrl, label: t(blocks, "case.meta.liveLabel") } : null}
                labels={{ client: t(blocks, "case.meta.client") }}
              />
            </div>

            {p.stack.length > 0 ? (
              <div className="mt-5 border-t border-divider-light pt-3">
                <p className="text-small text-ash max-w-none text-center mb-2">{t(blocks, "case.meta.stack")}</p>
                {/* Five tiles across: 5 x 64px + 4 x 24px gap = 416px, plus room for the edge fade. */}
                <InfiniteSlider gap={24} duration={40} durationOnHover={120} reverse className="mx-auto max-w-[520px] [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] py-2">
                  {/* Repeat short stacks so the loop never shows a gap. */}
                  {Array.from({ length: Math.max(1, Math.ceil(12 / p.stack.length)) }, () => p.stack).flat().map((s, i) => <StackMark key={`${s}-${i}`} name={s} />)}
                </InfiniteSlider>
              </div>
            ) : null}

            {p.hero || (p.videoUrl && p.videoProvider !== "R2") ? (
              <div className="mt-4 case-hero-wrap lg:max-w-[880px] lg:mx-auto">
                <CaseCover slug={p.slug} hero={p.hero} videoUrl={p.videoUrl} videoProvider={p.videoProvider} title={p.title} />
              </div>
            ) : null}

            {/* The story panel replaced the single body block (owner, 2026-09-16).
                Nothing written yet means no section, not an empty heading. */}
            {p.brief || p.whatWeBuilt ? (
              <CaseStory
                brief={p.brief}
                whatWeBuilt={p.whatWeBuilt}
                image={p.storyImage}
                side={p.storySide}
                labels={{ brief: t(blocks, "case.briefHeading"), whatWeBuilt: t(blocks, "case.builtHeading"), close: t(blocks, "case.closeLabel") }}
              />
            ) : null}

            {p.media.length > 0 ? (
              <section className="mt-5" aria-labelledby="gallery-heading">
                <SectionMarker as="h2" id="gallery-heading" className="border-t border-divider-light pt-2 mb-3">{t(blocks, "case.galleryHeading")}</SectionMarker>
                <GalleryCarousel items={p.media} labels={{ slide: t(blocks, "case.carouselSlide") }} />
              </section>
            ) : null}

            {p.decisions.length > 0 ? (
              <section className="mt-5" aria-labelledby="decisions-heading">
                <SectionMarker as="h2" id="decisions-heading" className="border-t border-divider-light pt-2">{t(blocks, "case.decisionsHeading")}</SectionMarker>
                <ol className="list-none m-0 p-0 mt-3 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                  {p.decisions.map((d, i) => (
                    <li key={i} className="border-l border-divider-light pl-3">
                      <p className="data text-ash max-w-none">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="text-h4 font-medium text-ink mt-1">{d.title}</h3>
                      <p className="mt-1 text-body text-ash max-w-[36ch]">{d.reason}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {p.phases.length > 0 ? (
              <section className="mt-5" aria-labelledby="timeline-heading">
                <SectionMarker as="h2" id="timeline-heading" className="border-t border-divider-light pt-2">{t(blocks, "case.timelineHeading")}</SectionMarker>
                <ol className="list-none m-0 p-0 mt-3 flex flex-col md:flex-row gap-3 md:gap-0 md:divide-x divide-divider-light">
                  {p.phases.map((f, i) => (
                    <li key={i} className="md:flex-1 md:px-3 first:md:pl-0">
                      <p className="data text-ash max-w-none">{f.when}</p>
                      <p className="text-body font-medium text-ink max-w-none mt-[4px]">{f.label}</p>
                      {f.note ? <p className="text-small text-ash max-w-[32ch] mt-[4px]">{f.note}</p> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {p.metrics.length > 0 ? (
              <section className="mt-5" aria-labelledby="metrics-heading">
                <SectionMarker as="h2" id="metrics-heading" className="border-t border-divider-light pt-2">{t(blocks, "case.metricsHeading")}</SectionMarker>
                <div className="mt-3">
                  <ResultsBento metrics={p.metrics} blocks={blocks} />
                </div>
                {p.afterNote ? (
                  <p className="mt-3 text-body text-ash max-w-[60ch]"><span className="text-small text-ash">{t(blocks, "case.afterLabel")}</span> <span className="text-ink">{p.afterNote}</span></p>
                ) : null}
              </section>
            ) : null}

            {p.testimonials.length > 0 ? (
              <section className="mt-5" aria-label="Client testimonial">
                {p.testimonials.slice(0, 1).map((q, i) => (
                  <figure key={i} className="m-0 border-l-2 border-lime pl-3 md:pl-4 max-w-[64ch]">
                    <blockquote className="m-0 text-h3 font-medium text-ink leading-snug">{q.quote}</blockquote>
                    <figcaption className="mt-2 flex items-center gap-2">
                      {q.avatarUrl ? <img src={q.avatarUrl} alt="" width={32} height={32} className="w-[32px] h-[32px] rounded-full object-cover" loading="lazy" /> : null}
                      <span className="text-small text-ash"><span className="text-ink font-medium">{q.authorName}</span>{q.authorRole ? `, ${q.authorRole}` : ""}{q.company ? `, ${q.company}` : ""}</span>
                    </figcaption>
                  </figure>
                ))}
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

            {p.team.length > 0 ? (
              <section className="mt-5" aria-labelledby="team-heading">
                <SectionMarker as="h2" id="team-heading" className="border-t border-divider-light pt-2">{t(blocks, "case.teamHeading")}</SectionMarker>
                <ul className="list-none m-0 p-0 mt-3 flex flex-wrap gap-3">
                  {p.team.map((m) => (
                    <li key={m.name} className="flex items-center gap-2">
                      {m.avatarUrl ? <img src={m.avatarUrl} alt="" width={40} height={40} className="w-[40px] h-[40px] rounded-full object-cover" loading="lazy" /> : <span aria-hidden="true" className="w-[40px] h-[40px] rounded-full bg-paper border border-divider-light" />}
                      <span><span className="block text-body font-medium text-ink">{m.name}</span><span className="block text-small text-ash">{m.role}</span></span>
                    </li>
                  ))}
                </ul>
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
