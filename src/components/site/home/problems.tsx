import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split } from "@/components/motion/split";
import { FocusList } from "./focus-list";

/** "Where the work goes": a sticky heading beside the problems, read one at a time. */
export function Problems({ blocks }: { blocks: Blocks }) {
  const items = lines(t(blocks, "home.problems.items")).map((l) => {
    const [title, note = ""] = l.split("|").map((s) => s.trim());
    return { title, note };
  });
  return (
    <section className="px-3 md:px-[48px] py-6 lg:py-7">
      <div className="max-w-layout mx-auto grid gap-5 lg:grid-cols-[5fr_7fr]">
        <div className="lg:sticky lg:top-[140px] self-start">
          <p className="cl-kicker" data-reveal="up">{t(blocks, "home.problems.kicker")}</p>
          <Split as="h2" text={t(blocks, "home.problems.heading")} className="text-display-l mt-2 max-w-[13ch]" />
        </div>
        <FocusList items={items} />
      </div>
    </section>
  );
}
