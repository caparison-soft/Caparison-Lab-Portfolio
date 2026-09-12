import { z } from "zod";

/** Shared between client forms and server actions. Form values are strings; schemas coerce. */

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);
export const optionalString = z.preprocess(emptyToNull, z.string().trim().max(2000).nullable());
export const optionalUrl = z.preprocess(emptyToNull, z.string().trim().url().max(500).nullable());
export const optionalInt = z.preprocess((v) => (v === "" || v === undefined || v === null ? null : Number(v)), z.number().int().nullable());
export const optionalDate = z.preprocess(emptyToNull, z.string().nullable());
export const bool = z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean());

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Give the project a title.").max(120),
  slug: z.string().trim().min(1, "A slug is required.").max(120).regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  summary: z.string().trim().max(160, "Keep the summary to 160 characters."),
  body: z.unknown().optional(),
  categoryId: z.preprocess(emptyToNull, z.string().nullable()),
  tagIds: z.array(z.string()).default([]),
  clientName: optionalString,
  clientLogoUrl: optionalUrl,
  year: optionalInt,
  teamSize: optionalInt,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  budgetMin: optionalInt,
  budgetMax: optionalInt,
  budgetCurrency: z.string().trim().length(3, "Three-letter currency code.").toUpperCase(),
  budgetDisplay: optionalString,
  durationValue: optionalInt,
  durationUnit: z.enum(["DAYS", "WEEKS", "MONTHS"]),
  durationDisplay: optionalString,
  metrics: z.array(z.object({ label: z.string().trim().min(1, "Label"), value: z.string().trim().min(1, "Value"), note: optionalString })).default([]),
  videoUrl: optionalString,
  videoProvider: z.enum(["R2", "YOUTUBE", "VIMEO"]),
  ctaMode: z.enum(["ENQUIRY", "EXTERNAL", "NONE"]),
  ctaLabel: optionalString,
  ctaHref: optionalUrl,
  ctaNote: optionalString,
  metaTitle: optionalString,
  metaDescription: optionalString,
  ogImageUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: bool,
  currentlyBuilding: bool,
  buildNote: optionalString,
  publishedAt: optionalDate,
}).superRefine((v, ctx) => {
  if (v.budgetMin != null && v.budgetMax != null && v.budgetMax < v.budgetMin) ctx.addIssue({ code: "custom", path: ["budgetMax"], message: "Max must be at least the min." });
  if (v.ctaMode === "EXTERNAL" && !v.ctaHref) ctx.addIssue({ code: "custom", path: ["ctaHref"], message: "External mode needs a link." });
});
/** Form values: strings for every scalar so inputs stay controlled; the schema coerces. */
export type ProjectInput = {
  title: string; slug: string; summary: string; body?: unknown; categoryId: string; tagIds: string[];
  clientName: string; clientLogoUrl: string; year: string; teamSize: string; liveUrl: string; repoUrl: string;
  budgetMin: string; budgetMax: string; budgetCurrency: string; budgetDisplay: string;
  durationValue: string; durationUnit: "DAYS" | "WEEKS" | "MONTHS"; durationDisplay: string;
  metrics: { label: string; value: string; note: string }[];
  videoUrl: string; videoProvider: "R2" | "YOUTUBE" | "VIMEO";
  ctaMode: "ENQUIRY" | "EXTERNAL" | "NONE"; ctaLabel: string; ctaHref: string; ctaNote: string;
  metaTitle: string; metaDescription: string; ogImageUrl: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; featured: boolean; currentlyBuilding: boolean; buildNote: string; publishedAt: string;
};
export type ProjectOutput = z.output<typeof projectSchema>;

export const capabilitySchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(slugPattern, "Lowercase letters, numbers and hyphens only."),
  blurb: z.string().trim().min(1, "A blurb is required.").max(400),
  startingPrice: optionalString,
  typicalTimeline: optionalString,
  deliverables: z.array(z.string().trim().min(1)).default([]),
  weight: z.preprocess((v) => Number(v), z.number().int().min(1).max(3)),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const testimonialSchema = z.object({
  quote: z.string().trim().min(1, "A quote is required.").max(600),
  authorName: z.string().trim().min(1, "Who said it?").max(120),
  authorRole: optionalString,
  company: optionalString,
  avatarUrl: optionalUrl,
  companyLogoUrl: optionalUrl,
  projectId: z.preprocess(emptyToNull, z.string().nullable()),
  featured: bool,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const processStepSchema = z.object({
  title: z.string().trim().min(1).max(80),
  duration: optionalString,
  description: z.string().trim().min(1).max(600),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1).max(200),
  answerText: z.string().trim().min(1, "An answer is required.").max(3000),
  group: optionalString,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  bio: optionalString,
  avatarUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const statSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(40),
  note: optionalString,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: optionalString,
  whatsapp: optionalString,
  location: optionalString,
  availabilityStatus: z.enum(["AVAILABLE", "LIMITED", "BOOKED"]),
  availabilityNote: optionalString,
  bookingUrl: optionalUrl,
  socialsGithub: optionalUrl,
  socialsLinkedin: optionalUrl,
  socialsX: optionalUrl,
  metaTitle: optionalString,
  metaDescription: optionalString,
  ogImageUrl: optionalUrl,
  faviconUrl: optionalUrl,
  gaId: optionalString,
  analyticsEnabled: bool,
  maintenanceMode: bool,
});

export const contentEntrySchema = z.object({ key: z.string().min(1), value: z.string().max(20000) });

export const tagSchema = z.object({ name: z.string().trim().min(1).max(40), kind: z.enum(["STACK", "INDUSTRY", "SERVICE"]) });

export type EntityName = "capability" | "testimonial" | "processStep" | "faq" | "teamMember" | "stat";
export const entitySchemas = {
  capability: capabilitySchema,
  testimonial: testimonialSchema,
  processStep: processStepSchema,
  faq: faqSchema,
  teamMember: teamMemberSchema,
  stat: statSchema,
} as const;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Zod issues to a flat { field: message } map for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
