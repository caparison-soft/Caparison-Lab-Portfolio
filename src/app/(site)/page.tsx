import { Section, SectionMarker, Spine } from "@/components/ui";
import { Hero } from "@/components/site/home/hero";
import { WorkIndex } from "@/components/site/home/work-index";
import { CapabilitySheet } from "@/components/site/home/capability-sheet";
import { ProcessStrip } from "@/components/site/home/process-strip";
import { ContactBlock } from "@/components/site/home/contact-block";
import { Testimonials } from "@/components/site/testimonials";
import { getBlocks, getSettings, t } from "@/lib/queries/content";
import { getCapabilities, getFeaturedProjects, getProcessSteps, getPublishedProjectCount, getTestimonials } from "@/lib/queries/home";
import { formatList } from "@/lib/format";

export const revalidate = 3600;

/** Homepage. Everything below is read from the database; nothing is hardcoded. */
export default async function HomePage() {
  const [blocks, settings, projects, total, capabilities, steps, testimonials] = await Promise.all([
    getBlocks(["Homepage", "Contact form"]),
    getSettings(),
    getFeaturedProjects(5),
    getPublishedProjectCount(),
    getCapabilities(),
    getProcessSteps(),
    getTestimonials(),
  ]);

  return (
    <main id="main">
      <Hero blocks={blocks} settings={settings} />
      <WorkIndex blocks={blocks} projects={projects} total={total} />
      <CapabilitySheet blocks={blocks} items={capabilities} />
      <ProcessStrip blocks={blocks} steps={steps} />
      {/* Nothing to quote yet means no band at all: the marker on its own read as
          a broken section (owner, 2026-09-15). */}
      {testimonials.featured.length > 0 ? (
        <Section id="clients" pad="tall">
          <Spine sticky={false} rail={<SectionMarker as="h2">{t(blocks, "home.testimonials.marker")}</SectionMarker>}>
            <Testimonials items={testimonials.featured} labels={{ previous: t(blocks, "home.testimonials.prevLabel"), next: t(blocks, "home.testimonials.nextLabel"), of: t(blocks, "home.testimonials.ofLabel") }} />
            {testimonials.companies.length > 0 ? (
              <p className="mt-5 text-body text-ash max-w-none">
                {t(blocks, "home.testimonials.rosterPrefix")} {formatList(testimonials.companies)}.
              </p>
            ) : null}
          </Spine>
        </Section>
      ) : null}
      <ContactBlock blocks={blocks} settings={settings} sourcePath="/" />
    </main>
  );
}
