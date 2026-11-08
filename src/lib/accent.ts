/**
 * Copy on the black home page marks its Bright Leaf words with asterisks:
 * "Your business has *more potential.*". This splits such a string into runs,
 * each with a flag for whether it is the accent. Unpaired asterisks are kept
 * as text.
 */
export type AccentRun = { text: string; accent: boolean };

export function parseAccent(text: string): AccentRun[] {
  const runs: AccentRun[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), accent: false });
    runs.push({ text: m[1], accent: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), accent: false });
  return runs;
}

/** The same string with the markers taken out, for screen readers and metadata. */
export function plainAccent(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
