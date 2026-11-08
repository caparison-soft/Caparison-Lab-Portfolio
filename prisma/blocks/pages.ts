import type { Block } from "./types";

/**
 * Copy for the light redesign: /work, the case pages, /about, /contact and
 * the 404. Merged over the base blocks in seed.ts by key, so a key that
 * already exists there is overridden here (the seed only rewrites values
 * the owner never edited).
 */
export const blocks: Block[] = [
  // ---- Work index
  { key: "work.index.kicker", group: "Work", label: "Index: label", value: "Work" },
  { key: "work.index.heading", group: "Work", label: "Index: heading", value: "Our own products,\nand concept builds.", helpText: "One line per sentence. Two lines read best." },
  { key: "work.index.sub", group: "Work", label: "Index: sub", value: "Every project says what it is. Our products are software we designed, built and still run. Concepts are worked examples for made-up businesses, built to show how we would approach yours." },
  { key: "work.index.emptyState", group: "Work", label: "Index: nothing matches", value: "Nothing matches those filters yet. Clear them to see everything." },
  { key: "work.filters.kindLabel", group: "Work", label: "Filter: kind group name", value: "Show", helpText: "Read by screen readers before the kind filters." },
  { key: "work.filters.kind.internal", group: "Work", label: "Filter: our products", value: "Our products" },
  { key: "work.filters.kind.concept", group: "Work", label: "Filter: concepts", value: "Concepts" },
  { key: "work.filters.kind.client", group: "Work", label: "Filter: client projects", value: "Client projects" },
  { key: "work.filters.categoryLabel", group: "Work", label: "Filter: category label", value: "Type" },
  { key: "work.filters.clearLabel", group: "Work", label: "Filter: clear", value: "Clear filters" },
  { key: "work.index.ctaHeading", group: "Work", label: "Index: closing heading", value: "Want this built for your business?" },
  { key: "work.index.ctaSub", group: "Work", label: "Index: closing sub", value: "Start with a free review of your website and Google listing. We send a short video with the three things we would fix first." },
  { key: "work.index.ctaButton", group: "Work", label: "Index: closing button", value: "Get a free website review" },

  // ---- Case study
  { key: "case.backLabel", group: "Case study", label: "Back link", value: "All work" },
  { key: "case.meta.factsLabel", group: "Case study", label: "Facts card name", value: "Project facts", helpText: "Read by screen readers for the card of facts beside the title." },
  { key: "case.meta.client", group: "Case study", label: "Meta: client", value: "Client" },
  { key: "case.meta.conceptClient", group: "Case study", label: "Meta: business (concepts)", value: "Example business", helpText: "Replaces the client label on a concept, whose business is made up." },
  { key: "case.meta.budget", group: "Case study", label: "Meta: budget", value: "Budget" },
  { key: "case.meta.conceptBudget", group: "Case study", label: "Meta: budget (concepts)", value: "Typical price", helpText: "On a concept the budget is what a build like it would cost, not what anyone paid." },
  { key: "case.meta.duration", group: "Case study", label: "Meta: duration", value: "Duration" },
  { key: "case.meta.year", group: "Case study", label: "Meta: year", value: "Year" },
  { key: "case.meta.team", group: "Case study", label: "Meta: team", value: "Team" },
  { key: "case.meta.stack", group: "Case study", label: "Meta: stack", value: "Built with" },
  { key: "case.meta.role", group: "Case study", label: "Meta: our part", value: "Our part" },
  { key: "case.meta.platform", group: "Case study", label: "Meta: platform", value: "Platform" },
  { key: "case.meta.stage", group: "Case study", label: "Meta: status", value: "Status" },
  { key: "case.meta.launched", group: "Case study", label: "Meta: launched", value: "Launched" },
  { key: "case.stage.live", group: "Case study", label: "Stage: live", value: "Live" },
  { key: "case.stage.beta", group: "Case study", label: "Stage: beta", value: "In beta" },
  { key: "case.stage.retired", group: "Case study", label: "Stage: retired", value: "Retired" },
  { key: "case.galleryHeading", group: "Case study", label: "Gallery heading", value: "Gallery" },
  { key: "case.decisionsHeading", group: "Case study", label: "Key decisions heading", value: "Key decisions" },
  { key: "case.timelineHeading", group: "Case study", label: "Timeline heading", value: "How it went" },
  { key: "case.metricsHeading", group: "Case study", label: "Results heading", value: "Results" },
  { key: "case.metricsHeadingConcept", group: "Case study", label: "Results heading (concepts)", value: "Targets, not results", helpText: "Replaces the results heading on a concept." },
  { key: "case.metricsConceptNote", group: "Case study", label: "Results note (concepts)", value: "These are the figures the concept was designed to hit. None of them was measured with real customers." },
  { key: "case.metricTargetLabel", group: "Case study", label: "Metric: target tag (concepts)", value: "Target", helpText: "Tag on every figure of a concept." },
  { key: "case.afterLabel", group: "Case study", label: "After-launch label", value: "Since launch" },
  { key: "case.testimonialLabel", group: "Case study", label: "Testimonial (screen readers)", value: "What the client said" },
  { key: "case.videosHeading", group: "Case study", label: "Videos heading", value: "Videos" },
  { key: "case.teamHeading", group: "Case study", label: "Team heading", value: "Who worked on it" },
  { key: "case.ctaHeading", group: "Case study", label: "CTA heading", value: "Want something like this?" },
  { key: "case.nextLabel", group: "Case study", label: "Next project label", value: "Next project" },
  { key: "case.previewNote", group: "Case study", label: "Draft preview banner", value: "Draft preview. Only people with this link can see it." },

  // ---- About
  { key: "about.kicker", group: "About", label: "Label", value: "About" },
  { key: "about.heading", group: "About", label: "Heading", value: "A small studio in Dhaka,\nbuilding for the trades.", helpText: "One line per sentence. Two lines read best." },
  { key: "about.lead", group: "About", label: "Lead", value: "We build websites, online booking, follow-up automation and content for home service businesses in the US, UK, Canada and Australia." },
  { key: "about.body", group: "About", label: "Body", type: "RICHTEXT", value: "Caparison Lab started as a software studio. We built our own products first: an HR platform, a marketplace for digital assets, and the tools behind them. That is where we learned to scope tightly, price in writing and ship in weeks.\n\nWe now point that at home service businesses, because their problems are concrete: calls missed after hours, quotes that never get followed up, websites that are hard to use on a phone. We have no home service clients yet, and we say so. What we can show you is our own products, concept builds for businesses like yours, and a free review of your website before you spend anything.\n\nWe are a small team. The person on your first call is the person who builds it." },
  { key: "about.valuesKicker", group: "About", label: "How we work: label", value: "How we work" },
  { key: "about.valuesHeading", group: "About", label: "How we work: heading", value: "What working with us is like." },
  { key: "about.values", group: "About", label: "How we work: list", value: "One price, in writing | You get a written plan with one figure and a launch date before we start. Changes are priced before we do them.\nYou own everything | The domain, the code, the content and every account are in your name from day one.\nReplies in a working day | Every message, on working days. We overlap with US, UK and Australian mornings or evenings.\nNo long contracts | Monthly work runs month to month and stops when you say so.", helpText: "One per line: the title, a vertical bar, then the line under it." },
  { key: "about.statsHeading", group: "About", label: "Stats heading", value: "By the numbers" },
  { key: "about.teamKicker", group: "About", label: "Team: label", value: "Team" },
  { key: "about.teamHeading", group: "About", label: "Team heading", value: "The people you will talk to." },
  { key: "about.processKicker", group: "About", label: "Process: label", value: "Process" },
  { key: "about.processHeading", group: "About", label: "Process: heading", value: "From a free review to a working site." },
  { key: "about.faqKicker", group: "About", label: "Questions: label", value: "Questions" },
  { key: "about.faqHeading", group: "About", label: "Questions: heading", value: "What people ask before they hire us." },
  { key: "about.ctaHeading", group: "About", label: "Closing: heading", value: "See what we would fix first." },
  { key: "about.ctaSub", group: "About", label: "Closing: sub", value: "Send us your website. Within a working day you get a short video with the three changes we would make, free." },
  { key: "about.ctaButton", group: "About", label: "Closing: button", value: "Get a free website review" },

  // ---- Contact
  { key: "contact.kicker", group: "Contact", label: "Label", value: "Contact" },
  { key: "contact.heading", group: "Contact", label: "Heading", value: "Tell us about\nyour business.", helpText: "One line per sentence." },
  { key: "contact.reviewHeading", group: "Contact", label: "Heading when a free review is picked", value: "Get a free\nwebsite review.", helpText: "Shown instead of the heading when the page is opened from a free-review button." },
  { key: "contact.sub", group: "Contact", label: "Sub", value: "A few lines is enough. We reply within one working day with questions, a review, or a time to talk." },
  { key: "contact.directLabel", group: "Contact", label: "Direct contact label", value: "Or write to us directly" },
  { key: "contact.availabilityLabel", group: "Contact", label: "Availability label", value: "Availability" },
  { key: "contact.locationLabel", group: "Contact", label: "Location label", value: "Based in" },
  { key: "contact.nextHeading", group: "Contact", label: "What happens next: heading", value: "What happens next" },
  { key: "contact.nextItems", group: "Contact", label: "What happens next: list", value: "We read it the same day and reply within one working day.\nFor a free review, you get a short video with the three things we would fix first.\nIf it fits, a 30-minute call in your time zone, then a written plan with one price.", helpText: "One step per line." },
  { key: "form.label.projectType", group: "Contact form", label: "What-you-need label", value: "What do you need?" },
  { key: "form.projectType.options", group: "Contact form", label: "What-you-need options", value: "Free website review\nA new website\nOnline booking and follow-up\nVideo and social content\nAds and local SEO\nSomething else", helpText: "One option per line. The first line is picked when someone arrives from a free-review button." },
  { key: "form.label.company", group: "Contact form", label: "Company label", value: "Business name" },
  { key: "form.label.message", group: "Contact form", label: "Message label", value: "Your business, and what you need" },
  { key: "form.help.message", group: "Contact form", label: "Message hint", value: "Your trade, where you work, and your website address if you have one." },
  { key: "form.budget.bands", group: "Contact form", label: "Budget bands", value: "Under $1,500\n$1,500 – $3,000\n$3,000 – $6,000\nOver $6,000\nMonthly only\nNot sure yet", helpText: "One option per line." },

  // ---- 404
  { key: "notFound.kicker", group: "Errors", label: "404 label", value: "Page not found" },
  { key: "notFound.body", group: "Errors", label: "404 body", value: "The link may be old, or the page may have moved. These are good places to start." },
  { key: "notFound.ctaLabel", group: "Errors", label: "404 main link", value: "Go to the home page" },
  { key: "notFound.workLabel", group: "Errors", label: "404 second link", value: "See the work" },
];
