import Link from "next/link";
import { SectionMarker, Section, Spine, DataLine } from "@/components/ui";
import { cx } from "@/lib/cx";
import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { CapabilityItem } from "@/lib/queries/home";

type CapabilitySheetProps = { blocks: Blocks; items: CapabilityItem[] };

/**
 * One bordered sheet with shared hairlines. Weight drives the span:
 * 3 = two columns by two rows, 2 = a full row, 1 = one cell. Not a bento.
 */
const span: Record<number, string> = {
  3: "md:col-span-2 md:row-span-2",
  2: "md:col-span-3",
  1: "",
};

export function CapabilitySheet({ blocks, items }: CapabilitySheetProps) {
  return (
    <Section id="capabilities" pad="tall" className="pb-5">
      <Spine rail={<SectionMarker as="h2">{t(blocks, "home.capabilities.marker")}</SectionMarker>}>
        <p className="text-h2 font-bold tracking-[-0.02em] max-w-none mb-3">{t(blocks, "home.capabilities.heading")}</p>
        <div className="sheet grid-cols-1 md:grid-cols-3 [grid-auto-flow:dense]">
          {items.map((c) => {
            const large = c.weight >= 3;
            const medium = c.weight === 2;
            return (
              <Link
                key={c.slug}
                href={`/capabilities#${c.slug}`}
                className={cx("group block no-underline p-3 bg-bone hover:bg-paper transition-colors dur-fast outline-offset-[-2px] flex flex-col", span[Math.min(3, Math.max(1, c.weight))])}
              >
                <h3 className={cx("text-ink", large ? "text-h2" : "text-h3")}>{c.title}</h3>
                <p className={cx("mt-1 text-ash", large ? "text-body-l max-w-[44ch]" : "text-body max-w-[40ch]")}>{c.blurb}</p>
                {large && c.deliverables.length > 0 ? (
                  <ul className="mt-3 list-none m-0 p-0 flex flex-col gap-1 border-t border-divider-light pt-2">
                    {c.deliverables.map((d) => (
                      <li key={d} className="text-small text-ink flex gap-1">
                        <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-olive-400 flex-none mt-[7px]" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className={cx("mt-auto pt-3", medium && "md:flex md:justify-between md:items-end")}>
                  <DataLine
                    items={[
                      ...(c.startingPrice ? [{ value: c.startingPrice }] : []),
                      ...(c.typicalTimeline ? [{ value: c.typicalTimeline }] : []),
                    ]}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Spine>
    </Section>
  );
}
