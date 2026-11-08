import type { Metadata } from "next";
import { lines, getBlocks, getSettings, t } from "@/lib/queries/content";
import { getFeaturedProjects, getProcessSteps } from "@/lib/queries/home";
import { getFaqs } from "@/lib/queries/about";
import { imageSrcSet } from "@/lib/media";
import { parseAccent } from "@/lib/accent";
import { HomeHero } from "@/components/site/home/orbit/hero";
import { HomeMission } from "@/components/site/home/orbit/mission";
import { HomeStatement, type StatementPiece } from "@/components/site/home/orbit/statement";
import { VideoGrow } from "@/components/site/home/orbit/video-grow";
import { BuildBlack } from "@/components/site/home/black/build-black";
import { WorkBlack } from "@/components/site/home/black/work-black";
import { ProcessBlack } from "@/components/site/home/black/process-black";
import { PromisesBlack } from "@/components/site/home/black/promises-black";
import { PricingBlack } from "@/components/site/home/black/pricing-black";
import { FaqBlack } from "@/components/site/home/black/faq-black";
import { ClosingBlack } from "@/components/site/home/black/closing-black";
import { CrowdStory } from "@/components/site/home/black/crowd-story";
import { ContactBlack } from "@/components/site/home/black/contact-black";
import { Starfield } from "@/components/site/home/black/starfield";
import { PrefetchRoutes } from "@/components/site/prefetch-routes";
import { LogoStrip } from "@/components/site/home/black/logo-strip";
import { VoicesBlack } from "@/components/site/home/black/voices-black";

export const revalidate = 3600;

// The layout's canonical is "./", which Vercel's ISR regeneration resolved to
// /index for the home page (live, 2026-11-08); the home states its own.
export const metadata: Metadata = {
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
};

/**
 * Homepage on black (owner, 2026-11-07): the orbit hero, the mission row, the
 * pinned statement with the rising phone, then what we build, work, process,
 * promises, questions and the closing offer. Every
 * string is a ContentBlock or a database row.
 */
export default async function HomePage() {
  const [blocks, footer, settings, projects, steps, faqs] = await Promise.all([
    getBlocks(["Homepage", "Work", "Navigation", "Contact", "Contact form"]),
    getBlocks(["Footer"]),
    getSettings(),
    getFeaturedProjects(4),
    getProcessSteps(),
    getFaqs(),
  ]);

  // The statement's [img] markers take the pictures set in home.statement.img1
  // and img2 (owner, 2026-11-08: the OfficeDay site, a person talking), and
  // fall back to the featured projects' thumbnails, in order.
  const projectCovers = projects.flatMap((p) => (p.cover ? [imageSrcSet(p.cover.keyPrefix, p.cover.variants)] : []));
  const covers = [1, 2].map((i, k) => {
    const set = t(blocks, `home.statement.img${i}`);
    return /^https?:\/\//.test(set) ? { src: set, srcSet: "" } : projectCovers[k % Math.max(1, projectCovers.length)];
  }).filter(Boolean) as { src: string; srcSet: string }[];
  let ci = 0;
  const pieces: StatementPiece[] = [];
  for (const run of parseAccent(t(blocks, "home.statement.text"))) {
    for (const part of run.text.split(/(\[img\])/)) {
      if (part === "[img]") {
        const c = covers[ci++ % Math.max(1, covers.length)];
        if (c) pieces.push({ kind: "img", src: c.src, srcSet: c.srcSet });
        continue;
      }
      for (const w of part.split(/\s+/)) if (w) pieces.push({ kind: "word", text: w, accent: run.accent });
    }
  }
  const pair = (v: string) => {
    const [title = "", body = ""] = v.split("|").map((x) => x.trim());
    return { title, body };
  };
  const jobs = lines(t(blocks, "home.statement.phone.jobs")).map((l) => {
    const [job = "", who = "", time = ""] = l.split("|").map((s) => s.trim());
    return { job, who, time };
  });

  return (
    <main id="main" className="home-black">
      <Starfield />
      <PrefetchRoutes hrefs={[...projects.filter((p) => !p.liveUrl).map((p) => `/work/${p.slug}`), "/#contact"]} />
      <HomeHero blocks={blocks} />
      <VideoGrow
        label={t(blocks, "home.video.label")}
        url={t(blocks, "home.video.url")}
        poster={t(blocks, "home.video.poster")}
        soon={t(blocks, "home.video.soon")}
        play={t(blocks, "home.video.play")}
      >
        <HomeMission blocks={blocks} />
      </VideoGrow>
      <HomeStatement
        pieces={pieces}
        cta={{ label: t(blocks, "home.statement.cta"), href: "/#services" }}
        phone={{
          day: t(blocks, "home.statement.phone.day"),
          business: t(blocks, "home.statement.phone.business"),
          headline: lines(t(blocks, "home.statement.phone.headline")),
          jobs,
          caller: t(blocks, "home.statement.phone.caller"),
          callLabel: t(blocks, "home.statement.phone.callLabel"),
          decline: t(blocks, "home.statement.phone.decline"),
          accept: t(blocks, "home.statement.phone.accept"),
          booked: pair(t(blocks, "home.statement.phone.booked")),
          rating: pair(t(blocks, "home.statement.phone.rating")),
        }}
        note={t(blocks, "home.statement.note")}
      />
      <LogoStrip blocks={blocks} />
      <VoicesBlack blocks={blocks} />
      <BuildBlack blocks={blocks} />
      <WorkBlack blocks={blocks} projects={projects} />
      <ProcessBlack blocks={blocks} steps={steps} />
      <PricingBlack blocks={blocks} />
      <PromisesBlack blocks={blocks} />
      <FaqBlack blocks={blocks} faqs={faqs} />
      <ClosingBlack blocks={blocks} settings={settings} />
      <ContactBlack blocks={blocks} settings={settings} />
      {/* The crowd story runs into the footer (owner, 2026-11-07). */}
      <CrowdStory
        copy={{
          label: t(blocks, "home.crowd.label"),
          captions: lines(t(blocks, "home.crowd.captions")),
          sign: t(blocks, "home.crowd.sign"),
          open: t(blocks, "home.crowd.open"),
          ask: t(blocks, "home.crowd.ask"),
          reply: t(blocks, "home.crowd.reply"),
          pieces: ["websites", "automation", "crm", "pipeline", "production", "ads"].map((id) => t(blocks, `home.orbit.${id}.name`)),
          studio: settings.siteName,
          end: {
            heading: t(footer, "footer.heading"),
            sub: t(footer, "footer.sub"),
            cta: t(blocks, "nav.cta"),
            ctaHref: "/#contact",
            email: settings.email,
          },
          legal: { left: `${new Date().getFullYear()} ${t(footer, "footer.copyright")}`, right: t(footer, "footer.tagline") },
          columns: {
            pagesLabel: t(footer, "footer.pagesLabel"),
            pages: [
              { href: "/#services", label: t(blocks, "nav.services") },
              { href: "/industries/home-services", label: t(blocks, "nav.homeServices") },
              { href: "/#work", label: t(blocks, "nav.work") },
              { href: "/#pricing", label: t(blocks, "nav.pricing") },
              { href: "/about", label: t(blocks, "nav.about") },
              { href: "/#contact", label: t(blocks, "nav.contact") },
            ],
            reachLabel: t(footer, "footer.reachLabel"),
            reach: [
              ...(settings.whatsapp ? [{ href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`, label: t(footer, "footer.whatsappLabel"), external: true }] : []),
              ...Object.entries(settings.socials).filter(([, url]) => Boolean(url)).map(([name, url]) => ({ href: url as string, label: name.charAt(0).toUpperCase() + name.slice(1), external: true })),
              { href: "/feed.xml", label: t(footer, "footer.rssLabel"), external: false },
            ],
            timeLabel: t(footer, "footer.timeLabel"),
            timeZone: t(footer, "footer.timeZone"),
            location: settings.location ?? "",
          },
        }}
      />
    </main>
  );
}
