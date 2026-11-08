import type { Metadata } from "next";
import { Split, vars } from "@/components/motion/split";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { getBlocks, getSettings, lines, t } from "@/lib/queries/content";
import { getProjectBySlugForForm } from "@/lib/queries/home";

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getBlocks(["Contact", "Navigation"]);
  return { title: t(blocks, "nav.contact"), description: t(blocks, "contact.sub") };
}

type SearchParams = Promise<{ project?: string; type?: string }>;

/**
 * Enquiry form plus direct contact and availability. ?project=slug fills in
 * the project the visitor came from; ?type=review (the header's free-review
 * button) picks the review option and swaps the heading.
 */
export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const { project, type } = await searchParams;
  const [blocks, settings, sourceProject] = await Promise.all([
    getBlocks(["Contact", "Contact form", "Homepage"]),
    getSettings(),
    project ? getProjectBySlugForForm(project) : Promise.resolve(null),
  ]);
  const projectTypes = lines(t(blocks, "form.projectType.options"));
  const review = type === "review";
  const next = lines(t(blocks, "contact.nextItems"));
  const query = new URLSearchParams();
  if (project) query.set("project", project);
  if (review) query.set("type", "review");
  const sourcePath = query.size > 0 ? `/contact?${query.toString()}` : "/contact";
  const available = settings.availabilityStatus !== "BOOKED";

  return (
    <main id="main">
      <section className="wk-top px-3 md:px-[48px] pb-6 lg:pb-7">
        {/* Intro, form, details in the DOM, so on a phone the form follows the
            heading; at lg the details move under the intro beside the form. */}
        <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] gap-x-6 gap-y-5">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="cl-kicker" data-reveal="up">{t(blocks, "contact.kicker")}</p>
            <Split as="h1" text={t(blocks, review ? "contact.reviewHeading" : "contact.heading")} className="mt-2 text-display-xl max-w-[14ch]" />
            <p className="mt-3 text-body-l text-ash max-w-[44ch]" data-reveal="up" style={vars({ "--d": 160 })}>{t(blocks, "contact.sub")}</p>

            {settings.availabilityNote || available ? (
              <p className="cl-pill mt-4" data-reveal="up" style={vars({ "--d": 220 })}>
                {available ? <span className="cl-live" aria-hidden="true" /> : null}
                <span className="sr-only">{t(blocks, "contact.availabilityLabel")}: </span>
                {settings.availabilityNote ?? settings.availabilityStatus.toLowerCase()}
              </p>
            ) : null}
          </div>

          <div className="wk-form-card self-start lg:col-start-2 lg:row-start-1 lg:row-span-2" data-reveal="up" style={vars({ "--d": 120 })}>
            <EnquiryForm
              surface="light"
              idPrefix="contact"
              ctaStyle
              sourcePath={sourcePath}
              sourceProject={sourceProject}
              budgetBands={lines(t(blocks, "form.budget.bands"))}
              timelineBands={lines(t(blocks, "form.timeline.bands"))}
              projectTypes={projectTypes}
              defaultProjectType={review ? projectTypes[0] : undefined}
              labels={{
                name: t(blocks, "form.label.name"),
                email: t(blocks, "form.label.email"),
                company: t(blocks, "form.label.company"),
                budget: t(blocks, "form.label.budget"),
                timeline: t(blocks, "form.label.timeline"),
                message: t(blocks, "form.label.message"),
                messageHelp: t(blocks, "form.help.message"),
                projectType: t(blocks, "form.label.projectType"),
                submit: t(blocks, "home.contact.submitLabel"),
                regarding: t(blocks, "form.label.regarding"),
              }}
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            {next.length > 0 ? (
              <div className="border-t border-divider-light pt-3" data-reveal="up">
                <h2 className="text-h4 font-bold text-ink">{t(blocks, "contact.nextHeading")}</h2>
                <ol className="wk-next-steps mt-2">
                  {next.map((n, i) => (
                    <li key={i}>
                      <span className="wk-n" aria-hidden="true">{i + 1}</span>
                      <span className="text-body text-ash">{n}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="mt-5 border-t border-divider-light pt-3" data-reveal="up">
              <p className="text-small text-ash max-w-none">{t(blocks, "contact.directLabel")}</p>
              <a href={`mailto:${settings.email}`} className="cl-link cl-link--always mt-1 inline-block text-h4 text-ink">{settings.email}</a>
              {/* The number is not published; WhatsApp is the second way in (owner, 2026-09-15). */}
              <div className="mt-2">
                <WhatsAppLink value={settings.whatsapp} label={t(blocks, "home.contact.whatsappLabel")} className="text-ink hover:text-ash" />
              </div>
              {settings.location ? (
                <p className="text-body text-ash max-w-none mt-2">{t(blocks, "contact.locationLabel")} {settings.location}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
