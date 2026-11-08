import type { Blocks } from "@/lib/queries/content";
import { lines, t } from "@/lib/queries/content";
import { Split } from "@/components/motion/split";
import { CountUp } from "@/components/motion/count-up";

/** What we put in writing: four figures that count up, with what each one means. */
export function Promises({ blocks }: { blocks: Blocks }) {
  const items = lines(t(blocks, "home.promises.items")).map((l) => {
    const [value, label = ""] = l.split("|").map((s) => s.trim());
    return { value, label };
  });
  return (
    <section className="px-3 md:px-[48px] py-6 lg:py-7">
      <div className="max-w-layout mx-auto">
        <p className="cl-kicker" data-reveal="up">{t(blocks, "home.promises.kicker")}</p>
        <Split as="h2" text={t(blocks, "home.promises.heading")} className="text-display-l mt-2 max-w-[20ch]" />
        <dl className="promise-grid mt-5" data-reveal="stagger">
          {items.map((it) => (
            <div key={it.value + it.label} className="promise">
              <dt className="sr-only">{it.label}</dt>
              <dd className="m-0">
                <CountUp value={it.value} className="promise-value" />
                <p className="mt-2 text-body text-ash" aria-hidden="true">{it.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
