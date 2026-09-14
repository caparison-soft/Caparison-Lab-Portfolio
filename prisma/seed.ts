/**
 * Seed: realistic content in the brand voice. Idempotent (upserts by slug/key).
 * Run with `npx prisma db seed` (uses DIRECT_URL via prisma.config.ts) or
 * `npx tsx prisma/seed.ts`.
 *
 * Client names, quotes, figures and people are placeholders written to be
 * replaced in the admin panel. Nothing here is lorem ipsum.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL is required to seed.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }) });

// ---- Tiptap JSON helpers ---------------------------------------------
import type { Prisma } from "../src/generated/prisma/client";
type Node = { type: string; attrs?: Record<string, string | number>; content?: Node[]; text?: string };
const text = (t: string): Node => ({ type: "text", text: t });
const p = (t: string): Node => ({ type: "paragraph", content: [text(t)] });
const h2 = (t: string): Node => ({ type: "heading", attrs: { level: 2 }, content: [text(t)] });
const li = (t: string): Node => ({ type: "listItem", content: [p(t)] });
const ul = (...items: string[]): Node => ({ type: "bulletList", content: items.map(li) });
const doc = (...content: Node[]): Prisma.InputJsonObject => ({ type: "doc", content: content as unknown as Prisma.InputJsonArray });

// ---- Content blocks ---------------------------------------------------
type Block = { key: string; group: string; label: string; value: string; helpText?: string; type?: "TEXT" | "RICHTEXT" | "URL" | "NUMBER" | "IMAGE" };

const blocks: Block[] = [
  // Navigation
  { key: "nav.work", group: "Navigation", label: "Work link", value: "work" },
  { key: "nav.capabilities", group: "Navigation", label: "Capabilities link", value: "capabilities" },
  { key: "nav.about", group: "Navigation", label: "About link", value: "about" },
  { key: "nav.contact", group: "Navigation", label: "Contact link", value: "contact" },
  { key: "nav.skipToContent", group: "Navigation", label: "Skip link", value: "Skip to content", helpText: "Shown to keyboard users on first Tab press." },
  { key: "nav.menuOpen", group: "Navigation", label: "Mobile menu open label", value: "Menu" },
  { key: "nav.menuClose", group: "Navigation", label: "Mobile menu close label", value: "Close" },
  { key: "nav.workAll", group: "Navigation", label: "Work panel: all-work link", value: "All work" },
  { key: "nav.capabilitiesAll", group: "Navigation", label: "Capabilities panel: all link", value: "All capabilities" },

  // Homepage
  { key: "home.hero.headline", group: "Homepage", label: "Hero headline", value: "Ideas into digital products.\nWe turn vision into reality.", helpText: "One line per sentence. Line breaks are kept. Three lines maximum." },
  { key: "home.hero.sub", group: "Homepage", label: "Hero sub", value: "Caparison Lab builds fast, scalable digital products for businesses and ambitious ideas." },
  { key: "home.hero.ctaPrimary", group: "Homepage", label: "Hero primary button", value: "Start a project" },
  { key: "home.hero.ctaSecondary", group: "Homepage", label: "Hero secondary link", value: "See the work" },
  { key: "home.live.label", group: "Homepage", label: "Live strip label", value: "currently building", helpText: "Sits above the project flagged as currently building." },
  { key: "home.live.empty", group: "Homepage", label: "Live strip when nothing is flagged", value: "next slot opens soon" },
  { key: "home.work.marker", group: "Homepage", label: "Work section marker", value: "work" },
  { key: "home.work.viewAllLabel", group: "Homepage", label: "Work view-all link", value: "All work", helpText: "The count is added automatically, e.g. \"All work (12)\"." },
  { key: "home.work.colProject", group: "Homepage", label: "Work column: project", value: "project" },
  { key: "home.work.colClient", group: "Homepage", label: "Work column: client", value: "client" },
  { key: "home.work.colBudget", group: "Homepage", label: "Work column: budget", value: "budget" },
  { key: "home.work.colDuration", group: "Homepage", label: "Work column: duration", value: "duration" },
  { key: "home.capabilities.marker", group: "Homepage", label: "Capabilities marker", value: "capabilities" },
  { key: "home.capabilities.heading", group: "Homepage", label: "Capabilities heading", value: "What we build" },
  { key: "home.process.marker", group: "Homepage", label: "Process marker", value: "process" },
  { key: "home.process.heading", group: "Homepage", label: "Process heading", value: "How a project runs" },
  { key: "home.testimonials.marker", group: "Homepage", label: "Testimonials marker", value: "clients" },
  { key: "home.testimonials.rosterPrefix", group: "Homepage", label: "Client roster prefix", value: "Also built for", helpText: "Followed by the company names of published testimonials." },
  { key: "home.testimonials.prevLabel", group: "Homepage", label: "Previous quote button (screen readers)", value: "Previous quote" },
  { key: "home.testimonials.nextLabel", group: "Homepage", label: "Next quote button (screen readers)", value: "Next quote" },
  { key: "home.testimonials.ofLabel", group: "Homepage", label: "Counter word", value: "of", helpText: "As in \"1 of 3\"." },
  { key: "home.contact.marker", group: "Homepage", label: "Contact marker", value: "contact" },
  { key: "home.contact.heading", group: "Homepage", label: "Contact heading", value: "Tell us what you're building." },
  { key: "home.contact.sub", group: "Homepage", label: "Contact sub", value: "We reply within one working day." },
  { key: "home.contact.submitLabel", group: "Homepage", label: "Contact submit button", value: "Send enquiry" },
  { key: "home.contact.successMessage", group: "Homepage", label: "Contact success message", value: "Sent. You'll hear from us within one working day." },

  // Contact form
  { key: "form.label.name", group: "Contact form", label: "Name label", value: "Name" },
  { key: "form.label.email", group: "Contact form", label: "Email label", value: "Email" },
  { key: "form.label.company", group: "Contact form", label: "Company label", value: "Company" },
  { key: "form.label.budget", group: "Contact form", label: "Budget label", value: "Budget" },
  { key: "form.label.timeline", group: "Contact form", label: "Timeline label", value: "Timeline" },
  { key: "form.label.message", group: "Contact form", label: "Message label", value: "What you're building" },
  { key: "form.label.regarding", group: "Contact form", label: "Regarding prefix", value: "Regarding", helpText: "Shown when the form was opened from a case study." },
  { key: "form.budget.bands", group: "Contact form", label: "Budget bands", value: "Under $5k\n$5k – $10k\n$10k – $20k\n$20k – $50k\nOver $50k\nNot sure yet", helpText: "One option per line." },
  { key: "form.timeline.bands", group: "Contact form", label: "Timeline bands", value: "This month\nNext 1 – 3 months\n3 – 6 months\nNo fixed date", helpText: "One option per line." },
  { key: "form.error.generic", group: "Contact form", label: "Generic error", value: "That didn't send. Check your connection and try again, or email us directly." },
  { key: "form.error.email", group: "Contact form", label: "Email error", value: "Enter an email address we can reply to." },
  { key: "form.error.required", group: "Contact form", label: "Required field error", value: "This field is required." },
  { key: "form.error.rateLimited", group: "Contact form", label: "Rate limit error", value: "Too many enquiries from this connection. Try again in an hour, or email us directly." },

  // Work index
  { key: "work.index.heading", group: "Work", label: "Work index heading", value: "Work" },
  { key: "work.index.sub", group: "Work", label: "Work index sub", value: "Every project with its budget band, duration and stack. Filter by what you need." },
  { key: "work.index.emptyState", group: "Work", label: "Work empty state", value: "No projects match those filters. Clear them to see everything." },
  { key: "work.filters.allLabel", group: "Work", label: "Filter: all", value: "All" },
  { key: "work.filters.categoryLabel", group: "Work", label: "Filter: category label", value: "Type" },
  { key: "work.filters.stackLabel", group: "Work", label: "Filter: stack label", value: "Stack" },
  { key: "work.filters.clearLabel", group: "Work", label: "Filter: clear", value: "Clear filters" },

  // Case study
  { key: "case.backLabel", group: "Case study", label: "Back link", value: "work" },
  { key: "case.meta.client", group: "Case study", label: "Meta: client", value: "client" },
  { key: "case.meta.budget", group: "Case study", label: "Meta: budget", value: "budget" },
  { key: "case.meta.duration", group: "Case study", label: "Meta: duration", value: "duration" },
  { key: "case.meta.year", group: "Case study", label: "Meta: year", value: "year" },
  { key: "case.meta.team", group: "Case study", label: "Meta: team", value: "team" },
  { key: "case.meta.stack", group: "Case study", label: "Meta: stack", value: "stack" },
  { key: "case.meta.liveLabel", group: "Case study", label: "Live site link", value: "Open the live site" },
  { key: "case.briefHeading", group: "Case study", label: "Brief heading", value: "the brief" },
  { key: "case.buildHeading", group: "Case study", label: "Build heading", value: "what we built" },
  { key: "case.metricsHeading", group: "Case study", label: "Metrics heading", value: "results" },
  { key: "case.decisionsHeading", group: "Case study", label: "Key decisions heading", value: "key decisions" },
  { key: "case.timelineHeading", group: "Case study", label: "Timeline heading", value: "how it went" },
  { key: "case.teamHeading", group: "Case study", label: "Team heading", value: "who worked on it" },
  { key: "case.afterLabel", group: "Case study", label: "After-launch label", value: "since launch" },
  { key: "case.meta.role", group: "Case study", label: "Meta: our part", value: "our part" },
  { key: "case.meta.platform", group: "Case study", label: "Meta: platform", value: "platform" },
  { key: "case.meta.stage", group: "Case study", label: "Meta: status", value: "status" },
  { key: "case.meta.launched", group: "Case study", label: "Meta: launched", value: "launched" },
  { key: "case.stage.live", group: "Case study", label: "Stage: live", value: "live" },
  { key: "case.stage.beta", group: "Case study", label: "Stage: beta", value: "in beta" },
  { key: "case.stage.retired", group: "Case study", label: "Stage: retired", value: "retired" },
  { key: "case.metricMeasured", group: "Case study", label: "Metric: measured-by joiner", value: "measured by", helpText: "Shown as \"first 90 days, measured by Mixpanel\"." },
  { key: "case.galleryHeading", group: "Case study", label: "Gallery heading", value: "gallery" },
  { key: "case.videosHeading", group: "Case study", label: "Videos heading", value: "videos" },
  { key: "case.carouselSlide", group: "Case study", label: "Carousel: slide word", value: "Slide", helpText: "Read by screen readers as \"Slide 2 / 5\"." },
  { key: "case.ctaHeading", group: "Case study", label: "CTA heading", value: "Want something like this?" },
  { key: "case.ctaDefaultLabel", group: "Case study", label: "CTA default button", value: "Start a project" },
  { key: "case.nextLabel", group: "Case study", label: "Next project label", value: "next" },

  // Capabilities page
  { key: "capabilities.heading", group: "Capabilities", label: "Heading", value: "What we build" },
  { key: "capabilities.sub", group: "Capabilities", label: "Sub", value: "Four things we do well, with a starting price and a typical timeline for each. If your project doesn't fit, say so in the enquiry and we'll tell you honestly whether we're the right studio." },
  { key: "capabilities.fromLabel", group: "Capabilities", label: "Price prefix", value: "from" },
  { key: "capabilities.deliverablesLabel", group: "Capabilities", label: "Deliverables label", value: "What you get" },

  // About
  { key: "about.heading", group: "About", label: "Heading", value: "A small studio that shows its work" },
  { key: "about.body", group: "About", label: "Body", type: "RICHTEXT", value: "Caparison Lab is a build studio based in Dhaka. We take a brief, scope it in a week, price it as a band, and ship working software in weeks. Every case study on this site lists what the project cost, how long it took, and what it ran on, because those are the numbers you actually want before you email a studio.\n\nWe are three engineers. We don't have account managers. The person you talk to in the scoping call is the person who writes the code." },
  { key: "about.teamHeading", group: "About", label: "Team heading", value: "team" },
  { key: "about.statsHeading", group: "About", label: "Stats heading", value: "by the numbers" },
  { key: "about.faqHeading", group: "About", label: "FAQ heading", value: "questions we get asked" },

  // Contact page
  { key: "contact.heading", group: "Contact", label: "Heading", value: "Tell us what you're building." },
  { key: "contact.sub", group: "Contact", label: "Sub", value: "A few lines is enough. We'll reply within one working day with questions or a time to talk." },
  { key: "contact.directLabel", group: "Contact", label: "Direct contact label", value: "or write to us directly" },

  // Footer
  { key: "footer.tagline", group: "Footer", label: "Tagline", value: "A studio that ships software and shows its work." },
  { key: "footer.copyright", group: "Footer", label: "Copyright", value: "Caparison Lab", helpText: "The year is added automatically." },
  { key: "footer.rssLabel", group: "Footer", label: "RSS link label", value: "RSS" },

  // Meta
  { key: "meta.defaultTitle", group: "SEO", label: "Default title", value: "Caparison Lab — web and mobile apps, scoped and shipped in weeks" },
  { key: "meta.defaultDescription", group: "SEO", label: "Default description", value: "A build studio in Dhaka. Web apps, mobile apps, automation and design systems, with the budget and timeline listed on every project." },
  { key: "meta.titleSuffix", group: "SEO", label: "Title suffix", value: "Caparison Lab", helpText: "Appended to page titles, e.g. \"Nexus CRM — Caparison Lab\"." },

  // 404
  { key: "notFound.heading", group: "Errors", label: "404 heading", value: "That page isn't here." },
  { key: "notFound.body", group: "Errors", label: "404 body", value: "The link may be old, or the project may have been unpublished. The work index has everything that's live." },
  { key: "notFound.ctaLabel", group: "Errors", label: "404 link", value: "Go to the work index" },
  { key: "maintenance.heading", group: "Errors", label: "Maintenance heading", value: "Back shortly." },
  { key: "maintenance.body", group: "Errors", label: "Maintenance body", value: "We're making a change to the site. Email hello@caparisonlab.com if it's urgent." },
];

// ---- Taxonomy ---------------------------------------------------------
const categories = [
  { slug: "web-application", name: "Web application", description: "Browser-based products, portals and internal tools.", order: 1 },
  { slug: "mobile-app", name: "Mobile app", description: "iOS and Android, usually one codebase.", order: 2 },
  { slug: "automation", name: "Automation", description: "Pipelines, integrations and back-office scripts that remove manual work.", order: 3 },
  { slug: "design-system", name: "Design system", description: "Component libraries and the documentation that keeps them used.", order: 4 },
];

const tags = [
  // stack
  ...["react", "next.js", "react-native", "typescript", "node", "python", "postgres", "supabase", "aws", "cloudflare", "stripe", "storybook", "redis"].map((s, i) => ({ slug: s.replace(".", "-"), name: s, kind: "STACK" as const, order: i + 1 })),
  // industry
  ...["logistics", "healthcare", "manufacturing", "fintech", "property", "coworking"].map((s, i) => ({ slug: s, name: s, kind: "INDUSTRY" as const, order: i + 1 })),
  // service
  ...["build", "design", "integration", "migration"].map((s, i) => ({ slug: `svc-${s}`, name: s, kind: "SERVICE" as const, order: i + 1 })),
];

// ---- Projects ---------------------------------------------------------
type ProjectSeed = {
  slug: string; title: string; summary: string; category: string; client: string; year: number;
  budgetMin: number; budgetMax: number; durationValue: number; teamSize: number;
  stack: string[]; industry: string[]; status: "DRAFT" | "PUBLISHED"; featured: boolean; order: number;
  liveUrl?: string; currentlyBuilding?: boolean; buildNote?: string;
  ctaMode?: "ENQUIRY" | "EXTERNAL" | "NONE"; ctaLabel?: string; ctaHref?: string; ctaNote?: string;
  metrics: { label: string; value: string; note?: string }[];
  body: Prisma.InputJsonObject;
};

const projects: ProjectSeed[] = [
  {
    slug: "nexus-crm", title: "Nexus CRM", summary: "Internal sales tooling for a 40-person freight-forwarding team.",
    category: "web-application", client: "Tarn Logistics", year: 2025,
    budgetMin: 12000, budgetMax: 18000, durationValue: 9, teamSize: 3,
    stack: ["react", "next-js", "postgres", "aws", "typescript"], industry: ["logistics"],
    status: "PUBLISHED", featured: true, order: 1, liveUrl: "https://example.com/nexus",
    ctaMode: "ENQUIRY", ctaLabel: "Build something like Nexus", ctaNote: "Internal tools usually land in the $10k – $20k band. Tell us the team size and what they do all day.",
    metrics: [
      { label: "faster quote turnaround", value: "40%", note: "median time from enquiry to sent quote, before and after" },
      { label: "dashboard load", value: "3.2s to 0.4s", note: "P75 on the office connection" },
      { label: "P1 bugs in the first 90 days", value: "0" },
    ],
    body: doc(
      h2("The brief"),
      p("Tarn runs freight between Chattogram and the Gulf. Forty people were quoting jobs out of a shared spreadsheet and three WhatsApp groups. Quotes went out late, and nobody could say which ones had been won."),
      p("They asked for a CRM. What they needed was a quoting tool with a pipeline attached, so that is what we scoped."),
      h2("What we built"),
      p("A Next.js app on Postgres with a quoting engine that pulls live rates from their two carriers, a pipeline board, and a nightly export to the accounts package they already used. Roles for sales, ops and finance. Bangla and English."),
      ul(
        "Quote builder with carrier rate lookup and margin guardrails",
        "Pipeline board with stage history and reasons for lost deals",
        "Nightly CSV export to Tally, matched to their existing chart of accounts",
        "Audit log on every quote edit",
      ),
      p("Nine weeks, three engineers. The first two weeks were scoping and a clickable prototype the sales lead used to reject half our assumptions, which is what it was for."),
    ),
  },
  {
    slug: "orbit-booking", title: "Orbit Booking", summary: "Room and desk booking for a three-site coworking operator.",
    category: "web-application", client: "Orbit Workspaces", year: 2024,
    budgetMin: 6000, budgetMax: 9000, durationValue: 5, teamSize: 2,
    stack: ["next-js", "supabase", "stripe", "typescript"], industry: ["coworking", "property"],
    status: "PUBLISHED", featured: true, order: 2, liveUrl: "https://example.com/orbit",
    ctaMode: "ENQUIRY",
    metrics: [
      { label: "front-desk booking calls", value: "-70%", note: "first month after launch" },
      { label: "weeks from brief to live", value: "5" },
    ],
    body: doc(
      h2("The brief"),
      p("Orbit runs three coworking sites in Dhaka. Members booked meeting rooms by calling the front desk, and the front desk kept a paper diary per site. Double bookings were a weekly event."),
      h2("What we built"),
      p("A member-facing booking app with a floor plan per site, hourly and daily rates, Stripe and bKash payment, and a front-desk view that replaced the diary. Supabase for auth and data so the whole thing runs on a small monthly bill."),
      ul("Floor-plan picker with live availability", "bKash and card payments", "Front-desk override and no-show handling", "Monthly usage report per member company"),
    ),
  },
  {
    slug: "meridian-intake", title: "Meridian patient intake", summary: "Tablet check-in for a six-clinic group in Dubai, replacing paper forms.",
    category: "mobile-app", client: "Meridian Health", year: 2025,
    budgetMin: 15000, budgetMax: 22000, durationValue: 10, teamSize: 3,
    stack: ["react-native", "node", "postgres", "aws"], industry: ["healthcare"],
    status: "PUBLISHED", featured: true, order: 3,
    ctaMode: "ENQUIRY", ctaNote: "Healthcare projects need a data-handling conversation first. Mention where patients are and where data must stay.",
    metrics: [
      { label: "average check-in", value: "11 min to 3 min", note: "measured across all six clinics in month two" },
      { label: "clinics live", value: "6" },
      { label: "forms rekeyed by reception", value: "0" },
    ],
    body: doc(
      h2("The brief"),
      p("Six clinics, one paper intake form, and a receptionist at each site typing it into the practice system after the patient had already sat down. Meridian wanted patients to check in on a tablet in Arabic or English and have the record appear in the clinical system before the consultation."),
      h2("What we built"),
      p("A React Native tablet app that runs offline and syncs, a Node service that maps intake answers onto the practice system's API, and an admin view for the clinic managers. Data stays in the UAE region."),
      ul("Arabic and English intake flow with signature capture", "Offline-first sync so a dropped connection never loses a form", "Mapping layer to the existing practice-management API", "Manager dashboard for wait times per clinic"),
    ),
  },
  {
    slug: "halda-payroll", title: "Halda payroll", summary: "Monthly payroll automation for a 1,200-worker garment factory.",
    category: "automation", client: "Halda Apparel", year: 2024,
    budgetMin: 9000, budgetMax: 14000, durationValue: 8, teamSize: 2,
    stack: ["python", "postgres", "next-js"], industry: ["manufacturing"],
    status: "PUBLISHED", featured: false, order: 4,
    ctaMode: "ENQUIRY",
    metrics: [
      { label: "monthly payroll run", value: "2 days to 4 hours" },
      { label: "attendance discrepancies caught", value: "312", note: "in the first three months, each one a manual query previously" },
    ],
    body: doc(
      h2("The brief"),
      p("Halda's payroll took two accountants two days a month, reconciling biometric attendance exports against shift rosters and overtime rules that lived in one person's head."),
      h2("What we built"),
      p("A Python pipeline that ingests the attendance export, applies the overtime and leave rules as versioned config, flags discrepancies for a human to resolve, and produces the bank file. A small Next.js front end for the two accountants to review exceptions."),
      ul("Rules engine with every rule in a reviewable config file", "Exception queue instead of silent corrections", "Bank file generation in the format their bank already accepts", "Full run history for audits"),
    ),
  },
  {
    slug: "sable-design-system", title: "Sable design system", summary: "A React component library and docs site for a Riyadh fintech's product team.",
    category: "design-system", client: "Sable Pay", year: 2025,
    budgetMin: 7000, budgetMax: 10000, durationValue: 6, teamSize: 2,
    stack: ["react", "typescript", "storybook"], industry: ["fintech"],
    status: "PUBLISHED", featured: false, order: 5,
    ctaMode: "ENQUIRY",
    metrics: [
      { label: "components documented", value: "48" },
      { label: "screens rebuilt on the system", value: "23", note: "by Sable's own team in the month after handover" },
    ],
    body: doc(
      h2("The brief"),
      p("Sable had four product squads and four slightly different button components. They wanted one library, with Arabic right-to-left support done properly, that their own engineers would keep using after we left."),
      h2("What we built"),
      p("Forty-eight components in React and TypeScript, RTL from the first commit, a Storybook with usage rules written in plain language, and a two-day handover with their engineers rebuilding a real screen on the system while we watched."),
      ul("Tokens for colour, type, space and motion, exported for Figma", "RTL and LTR tested on every component", "Accessibility checks in CI", "Contribution guide their team actually follows"),
    ),
  },
  {
    slug: "harbor-tracking", title: "Harbor container tracking", summary: "Customer-facing shipment tracking for a port logistics operator.",
    category: "web-application", client: "Harbor Line", year: 2024,
    budgetMin: 8000, budgetMax: 12000, durationValue: 7, teamSize: 2,
    stack: ["next-js", "node", "postgres", "redis", "cloudflare"], industry: ["logistics"],
    status: "PUBLISHED", featured: false, order: 6, liveUrl: "https://example.com/harbor",
    ctaMode: "EXTERNAL", ctaLabel: "Read Harbor's write-up", ctaHref: "https://example.com/harbor/blog",
    metrics: [
      { label: "where-is-my-container calls", value: "-55%" },
      { label: "customers using the portal in month one", value: "410" },
    ],
    body: doc(
      h2("The brief"),
      p("Harbor's customers phoned to ask where their containers were. Harbor's staff then phoned the port. A tracking page that answered the question would save everyone an afternoon."),
      h2("What we built"),
      p("A public tracking portal with per-customer logins, polling the port authority's feed every five minutes into Redis, with email and SMS alerts on status change. Served through Cloudflare so it stays up when the port feed doesn't."),
      ul("Container and bill-of-lading search", "Status alerts by email and SMS", "Customer accounts with saved shipments", "Feed outage handling that tells customers the truth"),
    ),
  },
  {
    slug: "kite-dispatch", title: "Kite dispatch", summary: "Rider dispatch and proof-of-delivery for a Dhaka courier.",
    category: "mobile-app", client: "Kite Couriers", year: 2026,
    budgetMin: 14000, budgetMax: 20000, durationValue: 7, teamSize: 3,
    stack: ["react-native", "node", "postgres"], industry: ["logistics"],
    status: "DRAFT", featured: false, order: 7,
    currentlyBuilding: true, buildNote: "wk 4 of 7",
    ctaMode: "NONE",
    metrics: [],
    body: doc(p("Case study in progress. Published when the project ships.")),
  },
];

// ---- Studio -----------------------------------------------------------
const capabilities = [
  {
    slug: "web-applications", title: "Web applications", weight: 3, order: 1,
    blurb: "Internal tools, customer portals and dashboards. Next.js and Postgres by default. If your problem needs something else, we'll say so in the scoping week.",
    startingPrice: "from $8k", typicalTimeline: "6 – 10 weeks",
    deliverables: [
      "A scoped backlog with a fixed price band before any build starts",
      "A staging environment you can open from week one",
      "Production deploy with monitoring and error alerts",
      "A handover document and a recorded walkthrough",
      "30 days of fixes after launch, included",
    ],
  },
  {
    slug: "mobile-apps", title: "Mobile apps", weight: 1, order: 2,
    blurb: "iOS and Android from one React Native codebase. Offline-first when the network is unreliable, which in our markets is often.",
    startingPrice: "from $12k", typicalTimeline: "8 – 12 weeks",
    deliverables: ["App Store and Play Store submission handled", "Offline sync where it matters", "Crash reporting wired in from day one", "30 days of fixes after launch, included"],
  },
  {
    slug: "automation", title: "Automation and integrations", weight: 1, order: 3,
    blurb: "The two-day monthly job that should take twenty minutes. Pipelines, syncs between systems, and the small back-office tools around them.",
    startingPrice: "from $3k", typicalTimeline: "2 – 6 weeks",
    deliverables: ["Every rule written down in reviewable config", "Exception handling that asks a human instead of guessing", "Run history for audits", "Runs on your infrastructure or ours"],
  },
  {
    slug: "design-systems", title: "Design systems", weight: 2, order: 4,
    blurb: "Component libraries your engineers keep using after we leave. Tokens, components, documentation, and a handover where your team builds a real screen on it.",
    startingPrice: "from $6k", typicalTimeline: "4 – 8 weeks",
    deliverables: ["Tokens exported for code and Figma", "Storybook with plain-language usage rules", "Accessibility checks in CI", "A contribution guide, and a handover day"],
  },
];

const processSteps = [
  { order: 1, title: "Scope", duration: "week 1", description: "A working session, then a written scope with a price band and a date. You can take it elsewhere. Most people don't." },
  { order: 2, title: "Build", duration: "weeks 2 – 8", description: "Staging is live from the first week. You see progress as software, not slide decks. Weekly call, written notes, no surprises at the end." },
  { order: 3, title: "Ship", duration: "week 9", description: "Production deploy, monitoring, a recorded walkthrough and a handover document. Your team can run it without us." },
  { order: 4, title: "Iterate", duration: "after launch", description: "Thirty days of fixes are included. After that, a monthly retainer if you want one, or nothing if you don't." },
];

const testimonials = [
  { order: 1, featured: true, project: "nexus-crm", authorName: "Rashed Karim", authorRole: "Head of sales", company: "Tarn Logistics", quote: "They spent the first two weeks telling us what we didn't need. The tool has been in daily use for a year and I have not had to call them once." },
  { order: 2, featured: true, project: "meridian-intake", authorName: "Dr Layla Haddad", authorRole: "Operations director", company: "Meridian Health", quote: "Check-in went from eleven minutes to three, and they measured it themselves rather than asking us to take their word for it." },
  { order: 3, featured: true, project: "orbit-booking", authorName: "Tanvir Ahmed", authorRole: "Founder", company: "Orbit Workspaces", quote: "Five weeks, one price, no change orders. The front desk stopped taking booking calls in the first month." },
  { order: 4, featured: false, project: "sable-design-system", authorName: "Noura Al-Rashid", authorRole: "Engineering lead", company: "Sable Pay", quote: "Our own team rebuilt twenty-three screens on the system in the month after handover. That is the only metric for a design system that matters." },
  { order: 5, featured: false, project: "halda-payroll", authorName: "Farida Begum", authorRole: "Finance manager", company: "Halda Apparel", quote: "Payroll now takes a morning. The exception queue caught three hundred attendance errors we had been paying out for years." },
];

const stats = [
  { order: 1, label: "projects shipped", value: "34" },
  { order: 2, label: "median weeks, brief to live", value: "7" },
  { order: 3, label: "clients who came back", value: "60%" },
  { order: 4, label: "years building", value: "4" },
];

const team = [
  { order: 1, name: "Arif", role: "Founder and lead engineer", bio: "Scopes every project and writes a good share of the code. Placeholder bio: replace in the admin panel." },
  { order: 2, name: "Second engineer", role: "Full-stack engineer", bio: "Placeholder. Replace with a real name and a two-line bio in the admin panel." },
  { order: 3, name: "Third engineer", role: "Mobile and design systems", bio: "Placeholder. Replace with a real name and a two-line bio in the admin panel." },
];

const faqs = [
  { order: 1, question: "How do you price a project?", answer: "As a band, after a one-week scoping engagement. The band is fixed once you approve the scope. If the scope changes, the band changes, in writing, before we do the work." },
  { order: 2, question: "What happens in the scoping week?", answer: "One working session with you, a written scope with a price band and a delivery date, and often a clickable prototype. You can take the scope to another studio. It is yours." },
  { order: 3, question: "Who owns the code?", answer: "You do, from the first commit. It lives in a repository you control, and we hand over the infrastructure at launch." },
  { order: 4, question: "Do you work with clients outside Bangladesh?", answer: "Yes. About half our work is in the Gulf. We overlap the Gulf working day fully and the European morning." },
  { order: 5, question: "What if we need changes after launch?", answer: "Thirty days of fixes are included in every project. After that, a monthly retainer if you want one, or nothing if you don't." },
];

const inquiries = [
  { name: "Sadia Rahman", email: "sadia@example.com", company: "Northbank Traders", budgetBand: "$10k – $20k", timelineBand: "Next 1 – 3 months", projectType: "web-application", message: "We run a wholesale business in Narayanganj and need a portal where our 200 retail customers can see stock, place orders and check invoices. Currently all on phone calls.", sourcePath: "/work/nexus-crm", status: "NEW" as const, project: "nexus-crm" },
  { name: "Omar Al-Sayed", email: "omar@example.com", company: "Al-Sayed Clinics", budgetBand: "$20k – $50k", timelineBand: "3 – 6 months", projectType: "mobile-app", message: "Saw the Meridian project. We have four clinics in Sharjah with the same paper problem. Can you talk next week?", sourcePath: "/work/meridian-intake", status: "READ" as const, project: "meridian-intake" },
  { name: "Mahmud Hasan", email: "mahmud@example.com", company: undefined, budgetBand: "Under $5k", timelineBand: "This month", projectType: "automation", message: "Need a script that pulls our Shopify orders into a Google Sheet every hour and flags anything over 50,000 taka.", sourcePath: "/contact", status: "REPLIED" as const },
];

// ---- Run --------------------------------------------------------------
async function main() {
  console.log("Seeding content blocks…");
  for (const [i, b] of blocks.entries()) {
    await prisma.contentBlock.upsert({
      where: { key: b.key },
      create: { key: b.key, label: b.label, group: b.group, type: b.type ?? "TEXT", value: b.value, defaultValue: b.value, helpText: b.helpText, order: i },
      // Never overwrite an edited value on re-seed; only refresh label, help and default.
      update: { label: b.label, group: b.group, type: b.type ?? "TEXT", defaultValue: b.value, helpText: b.helpText, order: i },
    });
  }

  console.log("Seeding site settings…");
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: "Caparison Lab",
      email: "hello@caparisonlab.com",
      phone: "+880 1700 000000",
      whatsapp: "+8801700000000",
      location: "Dhaka, Bangladesh",
      availabilityStatus: "AVAILABLE",
      availabilityNote: "available for Q1, 2 slots open",
      socials: { github: "https://github.com/caparisonlab", linkedin: "https://www.linkedin.com/company/caparisonlab" },
      metaTitle: "Caparison Lab — web and mobile apps, scoped and shipped in weeks",
      metaDescription: "A build studio in Dhaka. Web apps, mobile apps, automation and design systems, with the budget and timeline listed on every project.",
    },
    update: {},
  });

  console.log("Seeding taxonomy…");
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: { name: c.name, description: c.description, order: c.order } });
    categoryIds[c.slug] = row.id;
  }
  const tagIds: Record<string, string> = {};
  for (const t of tags) {
    const row = await prisma.tag.upsert({ where: { slug: t.slug }, create: t, update: { name: t.name, kind: t.kind, order: t.order } });
    tagIds[t.slug] = row.id;
  }

  // SEED_SAMPLES=false (production): copy, settings, taxonomy, capabilities and
  // process steps only. No sample projects, testimonials, stats, team, faqs or
  // enquiries; those are invented and must not go live.
  // SEED_SAMPLES=projects: additionally the three featured sample projects, as
  // placeholders the owner edits or unpublishes from the admin.
  const mode = process.env.SEED_SAMPLES ?? "true";
  const samples = mode !== "false";
  const projectsOnly = mode === "projects";

  console.log("Seeding capabilities and process steps…");
  for (const c of capabilities) {
    await prisma.capability.upsert({ where: { slug: c.slug }, create: { ...c, status: "PUBLISHED" }, update: { ...c, status: "PUBLISHED" } });
  }
  await prisma.processStep.deleteMany({});
  await prisma.processStep.createMany({ data: processSteps.map((s) => ({ ...s, status: "PUBLISHED" })) });

  if (!samples) {
    console.log("SEED_SAMPLES=false: skipping sample projects, testimonials, stats, team, faqs and enquiries.");
    console.log("Seeded:", { contentBlocks: await prisma.contentBlock.count(), capabilities: await prisma.capability.count(), processSteps: await prisma.processStep.count(), tags: await prisma.tag.count() });
    return;
  }

  console.log("Seeding projects…");
  const projectIds: Record<string, string> = {};
  for (const pr of projectsOnly ? projects.filter((p) => p.featured).slice(0, 3) : projects) {
    const data = {
      title: pr.title, summary: pr.summary, body: pr.body, categoryId: categoryIds[pr.category],
      clientName: pr.client, year: pr.year, budgetMin: pr.budgetMin, budgetMax: pr.budgetMax, budgetCurrency: "USD",
      durationValue: pr.durationValue, durationUnit: "WEEKS" as const, teamSize: pr.teamSize,
      liveUrl: pr.liveUrl, status: pr.status, featured: pr.featured, order: pr.order,
      currentlyBuilding: pr.currentlyBuilding ?? false, buildNote: pr.buildNote,
      ctaMode: pr.ctaMode ?? "ENQUIRY", ctaLabel: pr.ctaLabel, ctaHref: pr.ctaHref, ctaNote: pr.ctaNote,
      publishedAt: pr.status === "PUBLISHED" ? new Date(`${pr.year}-06-01T00:00:00Z`) : null,
    };
    const row = await prisma.project.upsert({ where: { slug: pr.slug }, create: { slug: pr.slug, ...data }, update: data });
    projectIds[pr.slug] = row.id;

    await prisma.projectTag.deleteMany({ where: { projectId: row.id } });
    await prisma.projectTag.createMany({
      data: [...pr.stack, ...pr.industry].map((slug) => {
        const tagId = tagIds[slug];
        if (!tagId) throw new Error(`Unknown tag slug "${slug}" on project ${pr.slug}`);
        return { projectId: row.id, tagId };
      }),
    });

    await prisma.projectMetric.deleteMany({ where: { projectId: row.id } });
    await prisma.projectMetric.createMany({ data: pr.metrics.map((m, i) => ({ ...m, projectId: row.id, order: i })) });
  }

  if (projectsOnly) {
    console.log("SEED_SAMPLES=projects: three featured placeholders seeded; no testimonials, stats, team, faqs or enquiries.");
    console.log("Seeded:", { projects: await prisma.project.count() });
    return;
  }

  console.log("Seeding testimonials, stats, team, faqs…");
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: testimonials.map(({ project, ...t }) => ({ ...t, projectId: project ? projectIds[project] : null, status: "PUBLISHED" })),
  });

  await prisma.stat.deleteMany({});
  await prisma.stat.createMany({ data: stats.map((s) => ({ ...s, status: "PUBLISHED" })) });

  await prisma.teamMember.deleteMany({});
  await prisma.teamMember.createMany({ data: team.map((m) => ({ ...m, status: "PUBLISHED" })) });

  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({ data: faqs.map((f) => ({ order: f.order, question: f.question, answer: doc(p(f.answer)), group: "General", status: "PUBLISHED" })) });

  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount === 0) {
    console.log("Seeding sample enquiries…");
    await prisma.inquiry.createMany({
      data: inquiries.map(({ project, ...q }) => ({ ...q, sourceProjectId: project ? projectIds[project] : null })),
    });
  }

  const counts = {
    contentBlocks: await prisma.contentBlock.count(),
    projects: await prisma.project.count(),
    capabilities: await prisma.capability.count(),
    processSteps: await prisma.processStep.count(),
    testimonials: await prisma.testimonial.count(),
    tags: await prisma.tag.count(),
    inquiries: await prisma.inquiry.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
