import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type SectionProps = {
  id?: string;
  /** bone is the page. paper is one raised band. dark is olive-950, used twice per page at most. */
  tone?: "bone" | "paper" | "dark";
  /** Vertical weight. Sections must not all share one height. */
  pad?: "tall" | "base" | "short" | "none";
  /** Override top/bottom independently, e.g. "pt-6 pb-0". */
  className?: string;
  /** Applied to the inner max-width container. */
  innerClassName?: string;
  as?: "section" | "div" | "header" | "footer";
  children: ReactNode;
};

const tones = {
  bone: "bg-bone text-ink",
  paper: "bg-paper text-ink",
  dark: "section-dark on-dark",
};

const pads = {
  tall: "py-6",
  base: "py-5",
  short: "py-4",
  none: "",
};

/** Full-bleed section with the page gutter and a 1240px inner container. */
export function Section({ id, tone = "bone", pad = "base", className, innerClassName, as: Tag = "section", children }: SectionProps) {
  return (
    <Tag id={id} className={cx("px-3 md:px-[48px]", tones[tone], pads[pad], className)}>
      <div className={cx("max-w-layout mx-auto", innerClassName)}>{children}</div>
    </Tag>
  );
}
