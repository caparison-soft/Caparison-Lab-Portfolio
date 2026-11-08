import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split, vars } from "@/components/motion/split";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { WhatsAppLink } from "@/components/site/whatsapp-link";

/**
 * Home on black: the contact form, just above the footer scene (owner,
 * 2026-11-07: the site is one page, so contact is a section; /contact without
 * a project now lands here). The free review is picked by default, since most
 * buttons on the page offer it. .theme-dark flips the light form's colours.
 * Server component; the form is the client island.
 */
export function ContactBlack({ blocks, settings }: { blocks: Blocks; settings: Settings }) {
  const projectTypes = lines(t(blocks, "form.projectType.options"));
  const next = lines(t(blocks, "contact.nextItems"));
  const available = settings.availabilityStatus !== "BOOKED";
  return (
    <section id="contact" className="theme-dark scroll-mt-[80px] px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-contact-heading">
      <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] gap-x-6 gap-y-5">
        <div className="lg:col-start-1 lg:row-start-1">
          <Split as="h2" id="hb-contact-heading" text={t(blocks, "contact.reviewHeading")} className="hb-h2 max-w-[14ch]" />
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
            idPrefix="home-contact"
            ctaStyle
            sourcePath="/#contact"
            sourceProject={null}
            budgetBands={lines(t(blocks, "form.budget.bands"))}
            timelineBands={lines(t(blocks, "form.timeline.bands"))}
            projectTypes={projectTypes}
            defaultProjectType={projectTypes[0]}
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
              <h3 className="text-h4 text-ink">{t(blocks, "contact.nextHeading")}</h3>
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
            <div className="mt-2">
              <WhatsAppLink value={settings.whatsapp} label={t(blocks, "home.contact.whatsappLabel")} className="text-ink hover:text-ash" />
            </div>
            {settings.location ? <p className="text-body text-ash max-w-none mt-2">{t(blocks, "contact.locationLabel")} {settings.location}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
