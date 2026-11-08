import Link from "next/link";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";
import { Split, vars } from "@/components/motion/split";
import { Parallax } from "@/components/motion/parallax";
import { HexMark } from "@/components/site/hex-mark";

const KIND_KEY = { CLIENT: "work.kind.client", INTERNAL: "work.kind.internal", CONCEPT: "work.kind.concept" } as const;

/** A project's picture, or a designed panel when it has none yet. */
function Cover({ p }: { p: IndexProject }) {
  if (p.cover) {
    const img = imageSrcSet(p.cover.keyPrefix, p.cover.variants);
    return <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 50vw, 100vw" alt={p.cover.alt ?? ""} className="work-img" loading="lazy" />;
  }
  return (
    <div className={cx("work-placeholder", p.kind === "CONCEPT" ? "work-placeholder-lime" : p.kind === "INTERNAL" ? "section-dark on-dark" : "")}>
      <HexMark variant="simple" className="work-placeholder-mark" />
      <span className="work-placeholder-title">{p.title}</span>
    </div>
  );
}

/** Home "Things we have built": three featured projects in an offset grid with parallax. */
export function WorkGrid({ blocks, projects }: { blocks: Blocks; projects: IndexProject[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="px-3 md:px-[48px] py-6 lg:py-7">
      <div className="max-w-layout mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="cl-kicker" data-reveal="up">{t(blocks, "home.work.kicker")}</p>
            <Split as="h2" text={t(blocks, "home.work.heading")} className="text-display-xl mt-2" />
            <p className="mt-2 text-body-l text-ash max-w-[48ch]" data-reveal="up">{t(blocks, "home.work.sub")}</p>
          </div>
          <Link href="/work" className="cl-link cl-link--always text-ink text-body-l" data-reveal="up">{t(blocks, "home.work.allLink")}</Link>
        </div>

        <div className="work-grid mt-5">
          {projects.map((p, i) => (
            <Parallax key={p.slug} offset={i % 2 === 0 ? 24 : 56} className={cx("work-cell", i === 0 && "work-cell-lead")}>
              <Link href={`/work/${p.slug}`} className="work-card no-underline text-ink" data-cursor="view" data-reveal="up" style={vars({ "--d": i * 90 })}>
                <div className="work-media" data-reveal="clip" style={vars({ "--d": i * 90 + 100 })}>
                  <div className="w-full h-full">
                    <Cover p={p} />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className={cx("cl-chip", p.kind === "CONCEPT" && "cl-chip--lime", p.kind === "INTERNAL" && "cl-chip--ink")}>{t(blocks, KIND_KEY[p.kind])}</span>
                  {p.category ? <span className="text-small text-ash">{p.category.name}</span> : null}
                </div>
                <h3 className="mt-1 text-h2 work-title">{p.title}</h3>
                <p className="mt-1 text-body text-ash max-w-[52ch]">{p.summary}</p>
              </Link>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
}
