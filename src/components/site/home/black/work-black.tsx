import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { IndexProject } from "@/lib/queries/home";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";
import { Split } from "@/components/motion/split";
import { HexMark } from "@/components/site/hex-mark";
import { WorkBlackTabs, type WorkItem, type WorkTab } from "./work-black-tabs";

/** The project's cover, or a quiet panel with the mark when it has none yet. */
function Cover({ p, lead }: { p: IndexProject; lead: boolean }) {
  if (p.cover) {
    const img = imageSrcSet(p.cover.keyPrefix, p.cover.variants);
    return (
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={lead ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
        alt={p.cover.alt ?? ""}
        className="hbw-img"
        loading="lazy"
      />
    );
  }
  return (
    <div className={cx("hbw-empty", p.kind === "CONCEPT" && "hbw-empty--leaf")}>
      <HexMark variant="simple" maskId="hexmark-work-empty" className="hbw-empty-mark" />
    </div>
  );
}

/**
 * Home on black: the featured projects, smaller (owner, 2026-11-07, after a
 * reference): a centred heading and line, a row of category tabs, and a framed
 * grid of 16:10 cards, three across. Kind and category labels stay off the
 * cards; the tabs carry the categories.
 */
export function WorkBlack({ blocks, projects }: { blocks: Blocks; projects: IndexProject[] }) {
  const cats: WorkTab[] = [];
  for (const p of projects) if (p.category && !cats.some((c) => c.slug === p.category!.slug)) cats.push({ slug: p.category.slug, label: p.category.name });
  const items: WorkItem[] = projects.map((p) => ({ kind: "project", slug: p.slug, title: p.title, summary: p.summary, category: p.category?.slug ?? null, liveUrl: p.liveUrl, cover: <Cover p={p} lead={false} /> }));
  // The videos (owner, 2026-11-07): their own cards, under Everything and Video production.
  const play = t(blocks, "home.work.videoPlay");
  for (const i of [1, 2, 3, 4]) {
    const video = t(blocks, `home.work.v${i}.video`);
    if (!/^https:\/\/player\.vimeo\.com\//.test(video)) continue;
    const title = t(blocks, `home.work.v${i}.title`);
    items.push({ kind: "video", slug: `video-${i}`, title, summary: t(blocks, `home.work.v${i}.summary`), category: "video-production", video, poster: t(blocks, `home.work.v${i}.poster`), ratio: t(blocks, `home.work.v${i}.ratio`), playLabel: play.replace("{title}", title) });
  }
  if (items.some((it) => it.kind === "video") && !cats.some((c) => c.slug === "video-production")) cats.push({ slug: "video-production", label: t(blocks, "home.work.videoTab") });
  const tabs: WorkTab[] = [{ slug: "all", label: t(blocks, "home.work.tabAll") }, ...cats];
  return (
    <section id="work" className="scroll-mt-[80px] px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-work-heading">
      <div className="max-w-layout mx-auto">
        <div className="text-center">
          <Split as="h2" id="hb-work-heading" text={t(blocks, "home.work.heading")} className="hb-h2 mx-auto max-w-[16ch]" />
          <p className="hb-sub mt-2 text-body max-w-[50ch] mx-auto" data-reveal="up">{t(blocks, "home.work.sub")}</p>
        </div>
        <div className="mt-5" data-reveal="up">
          {/* Tabs only help when there is more than one category. */}
          <WorkBlackTabs tabs={cats.length > 1 ? tabs : tabs.slice(0, 1)} items={items} closeLabel={t(blocks, "home.work.videoClose")} />
        </div>
      </div>
    </section>
  );
}

export default WorkBlack;
