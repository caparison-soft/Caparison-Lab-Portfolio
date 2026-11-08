import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import type { ProcessItem } from "@/lib/queries/home";
import { Split } from "@/components/motion/split";
import { ProcessBlackRow } from "./process-black-row";

/**
 * Home on black: how it works. The steps in a row on one line; on wide
 * screens the section pins and the line fills from the first step to the
 * last as you scroll, then the page moves on (owner, 2026-11-08).
 */
export function ProcessBlack({ blocks, steps }: { blocks: Blocks; steps: ProcessItem[] }) {
  if (steps.length === 0) return null;
  return (
    <ProcessBlackRow steps={steps} labelledBy="hb-process-heading">
      <Split as="h2" id="hb-process-heading" text={t(blocks, "home.process.heading")} className="hb-h2 text-center mx-auto max-w-[18ch]" />
    </ProcessBlackRow>
  );
}

export default ProcessBlack;
