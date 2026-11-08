import { Fragment, type CSSProperties, type ElementType } from "react";
import { cx } from "@/lib/cx";

type SplitProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Milliseconds before the first word moves. */
  delay?: number;
  /** Each "\n" in the text starts a new line block. */
  id?: string;
};

/** CSS custom properties are not in CSSProperties; this keeps the cast in one place. */
export function vars(v: Record<string, string | number>): CSSProperties {
  return v as CSSProperties;
}

/**
 * Splits a heading into masked words that rise into place when the
 * RevealObserver marks it as in view (data-reveal="words", CSS in
 * src/styles/site.css). Server component: the words are plain spans.
 * Screen readers get the sentence once from the sr-only copy; the
 * animated words are aria-hidden.
 */
export function Split({ text, as: Tag = "span", className, delay = 0, id }: SplitProps) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let i = 0;
  return (
    <Tag id={id} className={cx(className)} data-reveal="words" style={vars({ "--d": delay })}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span key={li} className={lines.length > 1 ? "cl-line" : undefined}>
            {line.split(/\s+/).map((word, wi, arr) => (
              <Fragment key={wi}>
                <span className="cl-w">
                  <span className="cl-wi" style={vars({ "--i": i++ })}>{word}</span>
                </span>
                {wi < arr.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
