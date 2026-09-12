import type { Metadata } from "next";
import { Section, SectionMarker, Spine, StatusDot } from "@/components/ui";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { getBlocks, getSettings, lines, t } from "@/lib/queries/content";
import { getProjectBySlugForForm } from "@/lib/queries/home";

const availabilityStatus = { AVAILABLE: "live", LIMITED: "progress", BOOKED: "draft" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["Contact"]);
  return { title: t(blocks, "contact.heading"), description: t(blocks, "contact.sub") };
}

/** Full form plus direct contact and availability. ?project=slug pre-fills the reference. */
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  const [blocks, settings, sourceProject] = await Promise.all([
    getBlocks(["Contact", "Contact form", "Homepage"]),
    getSettings(),
    project ? getProjectBySlugForForm(project) : Promise.resolve(null),
  ]);

  return (
    <main id="main">
      <Section pad="tall">
        <Spine
          rail={
            <div className="flex flex-col gap-3">
              <SectionMarker>{t(blocks, "home.contact.marker")}</SectionMarker>
              <StatusDot status={availabilityStatus[settings.availabilityStatus]} label={settings.availabilityNote ?? settings.availabilityStatus.toLowerCase()} />
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5">
            <div>
              <h1 className="text-display-l">{t(blocks, "contact.heading")}</h1>
              <p className="mt-3 text-body-l text-ash max-w-[40ch]">{t(blocks, "contact.sub")}</p>
              <div className="mt-5 border-t border-divider-light pt-3">
                <p className="text-small text-ash max-w-none">{t(blocks, "contact.directLabel")}</p>
                <a href={`mailto:${settings.email}`} className="mt-1 inline-block text-body-l text-ink no-underline hover:underline">{settings.email}</a>
                {settings.phone ? <p className="data text-ash mt-1 max-w-none"><a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="text-ash no-underline hover:text-ink">{settings.phone}</a></p> : null}
                {settings.location ? <p className="text-body text-ash max-w-none mt-1">{settings.location}</p> : null}
              </div>
            </div>
            <EnquiryForm
              surface="light"
              idPrefix="contact"
              sourcePath={project ? `/contact?project=${project}` : "/contact"}
              sourceProject={sourceProject}
              budgetBands={lines(t(blocks, "form.budget.bands"))}
              timelineBands={lines(t(blocks, "form.timeline.bands"))}
              labels={{
                name: t(blocks, "form.label.name"),
                email: t(blocks, "form.label.email"),
                company: t(blocks, "form.label.company"),
                budget: t(blocks, "form.label.budget"),
                timeline: t(blocks, "form.label.timeline"),
                message: t(blocks, "form.label.message"),
                submit: t(blocks, "home.contact.submitLabel"),
                regarding: t(blocks, "form.label.regarding"),
              }}
            />
          </div>
        </Spine>
      </Section>
    </main>
  );
}
