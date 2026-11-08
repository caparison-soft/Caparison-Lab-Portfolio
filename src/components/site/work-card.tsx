import { TransitionLink } from "@/components/site/view-transitions";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";
import { vars } from "@/components/motion/split";

export type Kind = "CLIENT" | "INTERNAL" | "CONCEPT";

export const KIND_KEY: Record<Kind, string> = { CLIENT: "work.kind.client", INTERNAL: "work.kind.internal", CONCEPT: "work.kind.concept" };

/** The kind label: a concept is a lime chip, our product an ink chip, a client project the plain chip. */
export function KindChip({ kind, blocks, className }: { kind: Kind; blocks: Blocks; className?: string }) {
  return (
    <span className={cx("cl-chip", kind === "CONCEPT" && "cl-chip--lime", kind === "INTERNAL" && "cl-chip--ink", className)}>
      {t(blocks, KIND_KEY[kind])}
    </span>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A designed panel for a project with no picture yet: its title, set large, on its kind's surface. */
function Placeholder({ title, kind }: { title: string; kind: Kind }) {
  return (
    <div className={cx("wk-ph", kind === "CONCEPT" && "wk-ph--concept", kind === "INTERNAL" && "wk-ph--internal")} aria-hidden="true">
      <span className="wk-ph-hex" />
      <span className="wk-ph-title">{title}</span>
    </div>
  );
}

/**
 * One project on the work index: picture (or placeholder), kind chip,
 * category, title and summary. The cursor turns into "View" over it; the
 * picture zooms on hover and carries the view-transition name the case
 * page's hero shares. Server component.
 */
export function WorkCard({ p, blocks, index }: { p: IndexProject; blocks: Blocks; index: number }) {
  const img = p.cover ? imageSrcSet(p.cover.keyPrefix, p.cover.variants) : null;
  return (
    <TransitionLink href={`/work/${p.slug}`} className="wk-card" data-cursor="view" data-reveal="up" style={vars({ "--d": (index % 2) * 120 })}>
      <div className="wk-media">
        <div className="wk-media-inner" style={p.cover ? ({ viewTransitionName: `cover-${p.slug}` } as React.CSSProperties) : undefined}>
          {img && p.cover ? (
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes="(min-width: 1240px) 588px, (min-width: 768px) 50vw, 100vw"
              alt={p.cover.alt ?? ""}
              width={p.cover.width ?? 4}
              height={p.cover.height ?? 3}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              style={p.cover.blurDataUrl ? { backgroundImage: `url(${p.cover.blurDataUrl})`, backgroundSize: "cover" } : undefined}
            />
          ) : (
            <Placeholder title={p.title} kind={p.kind} />
          )}
        </div>
        <div className="wk-media-chips">
          <KindChip kind={p.kind} blocks={blocks} />
        </div>
      </div>
      <div className="mt-3 wk-card-title">
        <div className="min-w-0">
          {p.category ? <p className="text-small text-ash max-w-none">{p.category.name}</p> : null}
          <h2 className="mt-[4px] text-h2"><span className="wk-card-name">{p.title}</span></h2>
        </div>
        <span className="wk-card-arrow" aria-hidden="true"><Arrow /></span>
      </div>
      <p className="mt-1 text-body text-ash max-w-[52ch]">{p.summary}</p>
    </TransitionLink>
  );
}
