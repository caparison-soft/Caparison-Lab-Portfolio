import { MediaFrame } from "@/components/ui";
import { StackMark } from "@/components/site/stack-logos";
import { InfiniteSlider } from "@/components/site/infinite-slider";
import { CaseCover } from "@/components/site/case-cover";
import { GalleryCarousel } from "@/components/site/gallery-carousel";
import { VideoPlayer } from "@/components/site/video-player";
import { CaseStory } from "@/components/site/case-story";
import { ResultsBento } from "@/components/site/results-bento";
import { CtaButton } from "@/components/site/cta-button";
import { TransitionLink } from "@/components/site/view-transitions";
import { Arrow, KindChip } from "@/components/site/work-card";
import { Split, vars } from "@/components/motion/split";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CaseStudy, MediaItem } from "@/lib/queries/work";
import { currencySymbol, formatBudget, formatDuration } from "@/lib/format";
import { CaseHeader, type Fact } from "@/components/site/case-header";
import { posterSrc, videoSrc } from "@/lib/media";
import { cx } from "@/lib/cx";
import { Starfield } from "@/components/site/home/black/starfield";

function VideoItem({ m }: { m: MediaItem }) {
  return (
    <figure className="m-0" data-reveal="up">
      <MediaFrame width={m.width ?? 16} height={m.height ?? 9}>
        <VideoPlayer src={videoSrc(m.keyPrefix)} poster={posterSrc(m.posterKey, m.keyPrefix)} label={m.alt ?? m.title ?? undefined} width={m.width ?? 16} height={m.height ?? 9} />
      </MediaFrame>
      {m.title || m.caption ? (
        <figcaption className="mt-2">
          {m.title ? <p className="text-h4 text-ink max-w-none">{m.title}</p> : null}
          {m.caption ? <p className="text-small text-ash max-w-[60ch]">{m.caption}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** A section heading whose words rise in as it scrolls into view. */
function Heading({ id, text, className }: { id: string; text: string; className?: string }) {
  return <Split as="h2" id={id} text={text} className={cx("text-display-l", className)} />;
}

export function CaseStudyView({ p, blocks, preview = false }: { p: CaseStudy; blocks: Blocks; preview?: boolean }) {
  const concept = p.kind === "CONCEPT";
  const budget = formatBudget(p);
  const duration = formatDuration(p, "long");
  const stageLabel = p.stage ? t(blocks, `case.stage.${p.stage.toLowerCase()}`) : null;
  const unitLong = { DAYS: "days", WEEKS: "weeks", MONTHS: "months" } as const;
  const budgetLabel = t(blocks, concept ? "case.meta.conceptBudget" : "case.meta.budget");
  // Empty facts are left out, not shown as dashes: our products have no budget or client.
  const facts: Fact[] = [
    ...(budget ? [p.budgetDisplay || p.budgetMin == null
      ? { kind: "money" as const, label: budgetLabel, symbol: "", min: 0, max: null, display: budget }
      : { kind: "money" as const, label: budgetLabel, symbol: currencySymbol(p.budgetCurrency), min: p.budgetMin, max: p.budgetMax }] : []),
    ...(duration ? [p.durationDisplay || p.durationValue == null
      ? { kind: "count" as const, label: t(blocks, "case.meta.duration"), value: 0, display: duration }
      : { kind: "count" as const, label: t(blocks, "case.meta.duration"), value: p.durationValue, unit: p.durationValue === 1 ? unitLong[p.durationUnit].slice(0, -1) : unitLong[p.durationUnit] }] : []),
    ...(p.launchedAt ? [{ kind: "date" as const, label: t(blocks, "case.meta.launched"), iso: p.launchedAt }] : p.year ? [{ kind: "count" as const, label: t(blocks, "case.meta.year"), value: p.year, display: String(p.year) }] : []),
    ...(stageLabel ? [{ kind: "text" as const, label: t(blocks, "case.meta.stage"), value: stageLabel, dot: p.stage === "LIVE" }] : []),
    ...(p.teamSize ? [{ kind: "count" as const, label: t(blocks, "case.meta.team"), value: p.teamSize }] : []),
  ];

  const ctaLabel = p.ctaLabel ?? t(blocks, "case.ctaDefaultLabel");
  const kindNote = p.kind === "CONCEPT" ? t(blocks, "work.kind.conceptNote") : p.kind === "INTERNAL" ? t(blocks, "work.kind.internalNote") : null;

  return (
    <main id="main" className="theme-dark">
      <Starfield />
      {preview ? (
        <div className="section-dark on-dark px-3 md:px-[48px] pt-[88px] pb-1">
          <p className="max-w-layout mx-auto text-small text-bone max-w-none">{t(blocks, "case.previewNote")} ({p.status.toLowerCase()})</p>
        </div>
      ) : null}
      <section className={cx("px-3 md:px-[48px] pb-6 lg:pb-7", preview ? "pt-5" : "wk-top")}>
        <div className="max-w-layout mx-auto">
          <article className="min-w-0">
            <TransitionLink href="/#work" className="cl-link inline-flex items-center gap-1 text-body text-ink">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
              {t(blocks, "case.backLabel")}
            </TransitionLink>

            {kindNote ? (
              <div className={cx("wk-kind-note mt-3", concept && "wk-kind-note--concept")} role="note" data-reveal="fade">
                <KindChip kind={p.kind} blocks={blocks} className="flex-none" />
                <p className="text-body text-ink max-w-[80ch]">{kindNote}</p>
              </div>
            ) : null}

            <div className="mt-4">
              <CaseHeader
                category={p.category ? p.category.name : null}
                kindLabel={kindNote ? null : t(blocks, `work.kind.${p.kind.toLowerCase()}`)}
                kind={p.kind}
                title={p.title}
                summary={p.summary}
                outcome={p.outcome}
                client={{ name: p.clientName, logoUrl: p.clientLogoUrl }}
                pills={[...(p.role ? p.role.split(",").map((r) => r.trim()).filter(Boolean) : []), ...p.platforms]}
                facts={facts}
                live={p.liveUrl ? { href: p.liveUrl, label: t(blocks, "case.meta.liveLabel") } : null}
                labels={{ client: t(blocks, concept ? "case.meta.conceptClient" : "case.meta.client"), facts: t(blocks, "case.meta.factsLabel") }}
              />
            </div>

            {p.stack.length > 0 ? (
              <div className="mt-5 pt-3 border-t border-divider-light flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <p className="cl-kicker flex-none">{t(blocks, "case.meta.stack")}</p>
                {/* Repeat short stacks so the loop never shows a gap. */}
                <InfiniteSlider gap={16} duration={40} durationOnHover={120} reverse className="min-w-0 flex-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-1">
                  {Array.from({ length: Math.max(1, Math.ceil(14 / p.stack.length)) }, () => p.stack).flat().map((s, i) => <StackMark key={`${s}-${i}`} name={s} />)}
                </InfiniteSlider>
              </div>
            ) : null}

            {p.hero || (p.videoUrl && p.videoProvider !== "R2") ? (
              <div className="mt-5 case-hero-wrap" data-reveal="scale">
                <CaseCover slug={p.slug} hero={p.hero} videoUrl={p.videoUrl} videoProvider={p.videoProvider} title={p.title} />
              </div>
            ) : null}

            {/* The story panel replaced the single body block (owner, 2026-09-16).
                Nothing written yet means no section, not an empty heading. */}
            {p.brief || p.whatWeBuilt ? (
              <div className="wk-sec">
                <CaseStory
                  brief={p.brief}
                  whatWeBuilt={p.whatWeBuilt}
                  image={p.storyImage}
                  side={p.storySide}
                  labels={{ brief: t(blocks, "case.briefHeading"), whatWeBuilt: t(blocks, "case.builtHeading"), close: t(blocks, "case.closeLabel") }}
                />
              </div>
            ) : null}

            {p.media.length > 0 ? (
              <section className="wk-sec" aria-labelledby="gallery-heading">
                <Heading id="gallery-heading" text={t(blocks, "case.galleryHeading")} className="mb-4" />
                <div data-reveal="fade">
                  <GalleryCarousel items={p.media} labels={{ slide: t(blocks, "case.carouselSlide") }} />
                </div>
              </section>
            ) : null}

            {p.decisions.length > 0 ? (
              <section className="wk-sec" aria-labelledby="decisions-heading">
                <Heading id="decisions-heading" text={t(blocks, "case.decisionsHeading")} />
                <ol className="list-none m-0 p-0 mt-4 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-2" data-reveal="stagger">
                  {p.decisions.map((d, i) => (
                    <li key={i} className="wk-decision cl-spot">
                      <span className="wk-decision-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-h4 font-bold text-ink mt-3">{d.title}</h3>
                      <p className="mt-1 text-body text-ash max-w-[40ch]">{d.reason}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {p.phases.length > 0 ? (
              <section className="wk-sec" aria-labelledby="timeline-heading">
                <Heading id="timeline-heading" text={t(blocks, "case.timelineHeading")} />
                <ol className="wk-phases mt-4" data-reveal="stagger">
                  {p.phases.map((f, i) => (
                    <li key={i} className="wk-phase">
                      <p className="data text-ash max-w-none">{f.when}</p>
                      <p className="text-h4 text-ink max-w-none mt-[4px]">{f.label}</p>
                      {f.note ? <p className="text-small text-ash max-w-[32ch] mt-[4px]">{f.note}</p> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {p.metrics.length > 0 ? (
              <section className="wk-sec" aria-labelledby="metrics-heading">
                <Heading id="metrics-heading" text={t(blocks, concept ? "case.metricsHeadingConcept" : "case.metricsHeading")} />
                {concept ? <p className="mt-2 text-body-l text-ash max-w-[56ch]" data-reveal="up">{t(blocks, "case.metricsConceptNote")}</p> : null}
                <div className="mt-4" data-reveal="up">
                  <ResultsBento metrics={p.metrics} blocks={blocks} target={concept ? t(blocks, "case.metricTargetLabel") : null} />
                </div>
                {p.afterNote ? (
                  <p className="mt-3 text-body text-ash max-w-[60ch]"><span className="text-small text-ash">{t(blocks, "case.afterLabel")}</span> <span className="text-ink">{p.afterNote}</span></p>
                ) : null}
              </section>
            ) : null}

            {p.testimonials.length > 0 ? (
              <section className="wk-sec" aria-label={t(blocks, "case.testimonialLabel")}>
                {p.testimonials.slice(0, 1).map((q, i) => (
                  <figure key={i} className="wk-quote m-0" data-reveal="up">
                    <span className="wk-quote-mark" aria-hidden="true">&ldquo;</span>
                    <blockquote className="m-0 text-h2 text-ink max-w-[30ch]">{q.quote}</blockquote>
                    <figcaption className="mt-3 flex items-center gap-2">
                      {q.avatarUrl ? <img src={q.avatarUrl} alt="" width={40} height={40} className="w-[40px] h-[40px] rounded-full object-cover" loading="lazy" /> : null}
                      <span className="text-body text-ash"><span className="text-ink font-medium">{q.authorName}</span>{q.authorRole ? `, ${q.authorRole}` : ""}{q.company ? `, ${q.company}` : ""}</span>
                    </figcaption>
                  </figure>
                ))}
              </section>
            ) : null}

            {p.videos.length > 0 ? (
              <section className="wk-sec" aria-labelledby="videos-heading">
                <Heading id="videos-heading" text={t(blocks, "case.videosHeading")} className="mb-4" />
                <div className="flex flex-col gap-4">
                  {p.videos.map((m) => <VideoItem key={m.id} m={m} />)}
                </div>
              </section>
            ) : null}

            {p.team.length > 0 ? (
              <section className="wk-sec" aria-labelledby="team-heading">
                <Heading id="team-heading" text={t(blocks, "case.teamHeading")} />
                <ul className="list-none m-0 p-0 mt-4 flex flex-wrap gap-3" data-reveal="stagger">
                  {p.team.map((m) => (
                    <li key={m.name} className="flex items-center gap-2 pr-3">
                      {m.avatarUrl ? <img src={m.avatarUrl} alt="" width={48} height={48} className="w-[48px] h-[48px] rounded-full object-cover" loading="lazy" /> : <span aria-hidden="true" className="w-[48px] h-[48px] rounded-full bg-paper border border-divider-light grid place-items-center font-bold text-ink">{m.name.slice(0, 1)}</span>}
                      <span><span className="block text-body font-medium text-ink">{m.name}</span><span className="block text-small text-ash">{m.role}</span></span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.ctaMode !== "NONE" ? (
              <aside className="wk-sec" aria-labelledby="case-cta-heading">
                <div className="wk-band on-dark md:flex md:items-end md:justify-between md:gap-4" data-reveal="up">
                  <span className="wk-band-hex" aria-hidden="true" />
                  <div className="relative">
                    <h2 id="case-cta-heading" className="text-display-l text-bone max-w-[18ch]">{t(blocks, "case.ctaHeading")}</h2>
                    {p.ctaNote ? <p className="mt-2 text-body-l text-sage max-w-[48ch]">{p.ctaNote}</p> : null}
                  </div>
                  <div className="relative mt-4 md:mt-0 flex-none">
                    {p.ctaMode === "ENQUIRY" ? (
                      <CtaButton href={`/contact?project=${encodeURIComponent(p.slug)}`}>{ctaLabel}</CtaButton>
                    ) : p.ctaHref ? (
                      <CtaButton href={p.ctaHref} external>{ctaLabel}</CtaButton>
                    ) : null}
                  </div>
                </div>
              </aside>
            ) : null}

            {p.next ? (
              <nav className="wk-sec" aria-label={t(blocks, "case.nextLabel")}>
                <p className="cl-kicker">{t(blocks, "case.nextLabel")}</p>
                <TransitionLink href={`/work/${p.next.slug}`} className="wk-next mt-2" data-cursor="view" data-reveal="up" style={vars({ "--d": 80 })}>
                  <span className="wk-next-title">{p.next.title}</span>
                  <span className="wk-card-arrow" aria-hidden="true"><Arrow /></span>
                </TransitionLink>
              </nav>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
