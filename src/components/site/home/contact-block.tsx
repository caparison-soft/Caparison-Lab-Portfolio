import { StatusDot } from "@/components/ui";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { EnquiryForm } from "@/components/site/enquiry-form";
import type { Blocks, Settings } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";

type ContactBlockProps = { blocks: Blocks; settings: Settings; sourcePath: string };

const availabilityStatus = { AVAILABLE: "live", LIMITED: "progress", BOOKED: "draft" } as const;


/** Dark. The form is the call to action, not a button that jumps to a page. */
export function ContactBlock({ blocks, settings, sourcePath }: ContactBlockProps) {
  return (
    <section id="contact" className="section-dark on-dark px-3 md:px-[48px] pt-6 pb-5">
      <div className="max-w-layout mx-auto flex flex-col gap-3">
        <aside className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-body font-medium text-sage max-w-none m-0">{t(blocks, "home.contact.marker")}</p>
          <StatusDot surface="dark" status={availabilityStatus[settings.availabilityStatus]} label={settings.availabilityNote ?? settings.availabilityStatus.toLowerCase()} />
        </aside>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
          <div>
            <h2 className="text-bone">{t(blocks, "home.contact.heading")}</h2>
            <p className="mt-2 text-body-l">{t(blocks, "home.contact.sub")}</p>
            <div className="mt-4 flex flex-col gap-1">
              <a href={`mailto:${settings.email}`} className="text-bone text-body-l no-underline hover:underline">{settings.email}</a>
              {/* The number is not published; WhatsApp is the second way in (owner, 2026-09-15). */}
              <WhatsAppLink value={settings.whatsapp} label={t(blocks, "home.contact.whatsappLabel")} className="text-sage hover:text-bone" />
              {settings.location ? <p className="text-sage max-w-none">{settings.location}</p> : null}
            </div>
          </div>
          <EnquiryForm
            surface="dark"
            sourcePath={sourcePath}
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
      </div>
    </section>
  );
}
