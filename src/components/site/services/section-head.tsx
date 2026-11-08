import { Split, vars } from "@/components/motion/split";
import { cx } from "@/lib/cx";

/** Kicker, a split heading that rises in, and an optional sub. Server component. */
export function SectionHead({ kicker, heading, sub, id, className, as = "h2", size = "text-display-l" }: { kicker: string; heading: string; sub?: string; id?: string; className?: string; as?: "h1" | "h2"; size?: string }) {
  return (
    <div className={cx("sv-head", className)}>
      <p className="cl-kicker" data-reveal="fade">{kicker}</p>
      <Split as={as} id={id} text={heading} className={cx("mt-2", size)} />
      {sub ? (
        <p className="mt-2 text-body-l sv-sub max-w-[52ch]" data-reveal="up" style={vars({ "--d": 160 })}>{sub}</p>
      ) : null}
    </div>
  );
}
