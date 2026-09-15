/** Formatting for genuine data: budgets, durations, lists. Pure, shared by server and client. */

export function currencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

export function k(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}k`;
  }
  return String(n);
}

/** "$12k – 18k". Uses the display override when the admin set one. */
export function formatBudget(p: { budgetMin: number | null; budgetMax: number | null; budgetCurrency: string; budgetDisplay: string | null }): string | null {
  if (p.budgetDisplay) return p.budgetDisplay;
  const sym = currencySymbol(p.budgetCurrency);
  if (p.budgetMin != null && p.budgetMax != null) return `${sym}${k(p.budgetMin)} – ${k(p.budgetMax)}`;
  if (p.budgetMin != null) return `from ${sym}${k(p.budgetMin)}`;
  if (p.budgetMax != null) return `up to ${sym}${k(p.budgetMax)}`;
  return null;
}

const unitShort = { DAYS: "d", WEEKS: "wk", MONTHS: "mo" } as const;
const unitLong = { DAYS: ["day", "days"], WEEKS: ["week", "weeks"], MONTHS: ["month", "months"] } as const;

/** "9 wk" (short) or "9 weeks" (long). Uses the display override when set. */
export function formatDuration(
  p: { durationValue: number | null; durationUnit: "DAYS" | "WEEKS" | "MONTHS"; durationDisplay: string | null },
  form: "short" | "long" = "short",
): string | null {
  if (p.durationDisplay) return p.durationDisplay;
  if (p.durationValue == null) return null;
  if (form === "short") return `${p.durationValue} ${unitShort[p.durationUnit]}`;
  const [one, many] = unitLong[p.durationUnit];
  return `${p.durationValue} ${p.durationValue === 1 ? one : many}`;
}

/** "A, B, and C" */
export function formatList(items: string[]): string {
  try {
    return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

/** Two-digit sequence marker: 1 -> "01". Only for genuine sequences. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
