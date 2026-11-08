import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { FaqItem } from "@/lib/queries/about";
import { Split } from "@/components/motion/split";
import { RichText } from "@/components/site/rich-text";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { FaqBlackList } from "./faq-black-list";

/** Home on black: the questions people ask, with the assistant for anything else. */
export function FaqBlack({ blocks, faqs }: { blocks: Blocks; faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-faq-heading">
      {/* Centred heading, no label above it, the questions under it (owner, 2026-11-07). */}
      <div className="max-w-layout mx-auto">
        <div className="text-center">
          <Split as="h2" id="hb-faq-heading" text={t(blocks, "home.faq.heading")} className="hb-h2 mx-auto max-w-[16ch]" />
          <p className="hb-sub mt-3 text-body-l max-w-[44ch] mx-auto" data-reveal="up">{t(blocks, "home.faq.askNote")}</p>
          <div className="mt-4" data-reveal="up">
            <ArrowFillButton size="sm" label={t(blocks, "home.faq.askLabel")} data-chat-open />
          </div>
        </div>
        <div className="mt-5 lg:mt-6 max-w-[820px] mx-auto">
        <FaqBlackList
          items={faqs.map((f) => ({
            question: f.question,
            // RichText sets ink and ash on its elements; on black paragraphs read sage, emphasis bone.
            answer: <RichText content={f.answer} className="[&_p.text-ink]:text-sage [&_.text-ink]:text-bone [&_.text-ash]:text-sage [&_.border-divider-light]:border-[color:var(--hb-line)]" />,
          }))}
        />
        </div>
      </div>
    </section>
  );
}

export default FaqBlack;
