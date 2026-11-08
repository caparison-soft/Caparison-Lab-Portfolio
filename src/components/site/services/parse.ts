import { lines } from "@/lib/queries/content";

/**
 * Splits a list block ("one per line: a | b | c") into rows of trimmed
 * fields. Rows are padded to `fields` so a line missing its last part renders
 * empty rather than throwing.
 */
export function rows(value: string, fields: number): string[][] {
  return lines(value).map((line) => {
    const parts = line.split("|").map((s) => s.trim());
    while (parts.length < fields) parts.push("");
    return parts.slice(0, fields);
  });
}

/** "a; b; c" into a list, blanks dropped. */
export function semis(value: string): string[] {
  return value.split(";").map((s) => s.trim()).filter(Boolean);
}
