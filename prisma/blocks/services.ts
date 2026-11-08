import type { Block } from "./types";

/**
 * Copy for the light redesign (services). Merged over the base blocks in seed.ts by key.
 * The /services page. The four service groups themselves are Capability rows
 * (title, blurb, deliverables, price, timeline), edited under Capabilities.
 */
const G = "Services page";

export const blocks: Block[] = [
  // SEO
  { key: "services.meta.title", group: G, label: "Browser title", value: "Services and prices" },
  { key: "services.meta.description", group: G, label: "Search description", value: "Websites, online booking, follow-up automation, video and ads for home service businesses. Starting prices, timelines and how we work." },

  // Hero
  { key: "services.hero.kicker", group: G, label: "Hero: label", value: "Services" },
  { key: "services.hero.title", group: G, label: "Hero: headline", value: "What a home service business needs online.\nOne team, fixed prices.", helpText: "One line per sentence." },
  { key: "services.hero.sub", group: G, label: "Hero: sub", value: "Four groups of work: the website, the automation behind it, the content that fills it and the marketing that brings people to it. Start with one. Add the next when the first one pays for itself." },
  { key: "services.hero.cta", group: G, label: "Hero: main button", value: "Get a free website review", helpText: "Opens the contact page with the review option picked." },
  { key: "services.hero.ctaSecondary", group: G, label: "Hero: second button", value: "How it works for home services" },
  { key: "services.hero.jumpLabel", group: G, label: "Hero: group tiles name", value: "Jump to a service group", helpText: "Read out by screen readers for the four tiles beside the headline." },

  // Service groups
  { key: "services.index.label", group: G, label: "Groups: side index label", value: "On this page" },
  { key: "services.group.includedLabel", group: G, label: "Groups: list label", value: "What's included" },
  { key: "services.group.priceLabel", group: G, label: "Groups: price label", value: "Starting price" },
  { key: "services.group.timelineLabel", group: G, label: "Groups: timeline label", value: "Timeline" },
  { key: "services.group.cta", group: G, label: "Groups: button", value: "Ask about this" },

  // How we price
  { key: "services.pricing.kicker", group: G, label: "Pricing: label", value: "How we price" },
  { key: "services.pricing.heading", group: G, label: "Pricing: heading", value: "One price, agreed before we start. No hourly billing." },
  { key: "services.pricing.sub", group: G, label: "Pricing: sub", value: "The prices on this page are where each group starts. After a 30-minute call you get a written plan with one figure and a launch date." },
  { key: "services.pricing.items", group: G, label: "Pricing: list", value: "$0 | The website review and the written plan. You pay nothing until you agree to a price.\n1 price | Fixed and in writing before we start. If the scope changes, we price the change before doing it.\n30 days | Of fixes after launch, included in every build.\nMonthly | Content, ads and support run month to month and stop when you say so.", helpText: "One per line: the figure, a vertical bar, then what it means." },

  // Process
  { key: "services.process.kicker", group: G, label: "Process: label", value: "How it works" },
  { key: "services.process.heading", group: G, label: "Process: heading", value: "From a free review to booked jobs." },
  { key: "services.process.sub", group: G, label: "Process: sub", value: "Five steps. Most websites go live four to five weeks after the first call." },

  // FAQ
  { key: "services.faq.kicker", group: G, label: "FAQ: label", value: "Questions" },
  { key: "services.faq.heading", group: G, label: "FAQ: heading", value: "What people ask before they hire us." },

  // Closing
  { key: "services.cta.heading", group: G, label: "Closing: heading", value: "Not sure where to start? Start with the free review." },
  { key: "services.cta.sub", group: G, label: "Closing: sub", value: "We look at your website and Google listing the way a customer would, then send a short video with the three things we would fix first. It takes us a day. It costs you nothing." },
  { key: "services.cta.button", group: G, label: "Closing: main button", value: "Get a free website review" },
  { key: "services.cta.secondary", group: G, label: "Closing: second button", value: "See the work" },
];
