import { Fragment } from "react";
import { parseAccent, plainAccent } from "@/lib/accent";

/**
 * The hero headline (owner, 2026-11-07). Words rise in one after another;
 * asterisk-marked words are Bright Leaf; "{lock}" draws an open padlock in
 * place of a letter (the o of "unlock"). The padlock leans right and its
 * shackle swings open to the right, over the short c, so it never meets the
 * tall l (owner caught the first version touching it). Screen readers get the
 * plain sentence. Server component; the motion is CSS.
 */
function Lock() {
  return (
    <span className="ob-lock" aria-hidden="true">
      <svg viewBox="0 0 24 30">
        <g className="ob-lock-shackle">
          <path d="M6.6 12.5V8.2a5.4 5.4 0 0 1 10.8 0v4.3" fill="none" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" />
        </g>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M6.5 11.5h11a4.5 4.5 0 0 1 4.5 4.5v8.5a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 24.5V16a4.5 4.5 0 0 1 4.5-4.5ZM12 16.6a2.3 2.3 0 0 0-1.2 4.27V23.6a1.2 1.2 0 0 0 2.4 0v-2.73A2.3 2.3 0 0 0 12 16.6Z"
        />
      </svg>
    </span>
  );
}

export function OrbitHeadline({ text }: { text: string }) {
  let n = 0;
  return (
    <h1 className="ob-h1">
      <span className="sr-only">{plainAccent(text).replace(/\{lock\}/g, "o")}</span>
      <span aria-hidden="true">
        {parseAccent(text).map((run, ri) =>
          run.text.split(/(\s+)/).map((word, wi) => {
            if (!word) return null;
            if (/^\s+$/.test(word)) return <Fragment key={`${ri}-${wi}`}> </Fragment>;
            const i = n++;
            const parts = word.split("{lock}");
            return (
              <span key={`${ri}-${wi}`} className="ob-w">
                <span className={run.accent ? "hb-lf" : undefined} style={{ ["--i" as string]: i }}>
                  {parts.map((p, pi) => (
                    <Fragment key={pi}>
                      {pi > 0 ? <Lock /> : null}
                      {p}
                    </Fragment>
                  ))}
                </span>
              </span>
            );
          }),
        )}
      </span>
    </h1>
  );
}
