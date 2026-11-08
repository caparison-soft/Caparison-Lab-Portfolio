import type { Block } from "./types";

/**
 * Copy for the light redesign (industry). Merged over the base blocks in seed.ts by key.
 * The /industries/home-services page: written for the owner of a plumbing,
 * HVAC or roofing company. Package prices are placeholders for the owner to
 * confirm; they follow the capability prices (website from $1,500, automation
 * from $2,000, content from $800 a month, ads from $600 a month).
 */
const G = "Industry: home services";
const K = "industry.homeServices";

export const blocks: Block[] = [
  // SEO
  { key: `${K}.meta.title`, group: G, label: "Browser title", value: "Websites and booking for home service businesses" },
  { key: `${K}.meta.description`, group: G, label: "Search description", value: "Websites, online booking and text follow-up for plumbing, HVAC, roofing and other trade businesses in the US, UK, Canada and Australia. Fixed prices, a free review first." },

  // Hero
  { key: `${K}.hero.kicker`, group: G, label: "Hero: label", value: "For home service businesses" },
  { key: `${K}.hero.title`, group: G, label: "Hero: headline", value: "Book more jobs\nwithout answering every call.", helpText: "One line per break. Two lines read best." },
  { key: `${K}.hero.sub`, group: G, label: "Hero: sub", value: "For plumbing, HVAC, roofing and other trade companies in the US, UK, Canada and Australia. We build the website, the online booking and the text follow-up, so a customer who finds you at 9 pm has a time booked by 9:02." },
  { key: `${K}.hero.cta`, group: G, label: "Hero: main button", value: "Get a free website review" },
  { key: `${K}.hero.ctaSecondary`, group: G, label: "Hero: second button", value: "See the system", helpText: "Scrolls to the step-by-step system further down the page." },
  { key: `${K}.hero.facts`, group: G, label: "Hero: three facts", value: "Under 1 minute | to text back a new request, day or night\n2 – 4 weeks | from a written plan to a live website\nFrom $1,500 | fixed, in writing, before we start", helpText: "One per line: the figure, a vertical bar, then the note. Three lines." },

  // Costs
  { key: `${K}.costs.kicker`, group: G, label: "Costs: label", value: "What it costs now" },
  { key: `${K}.costs.heading`, group: G, label: "Costs: heading", value: "The jobs you lose never show up in the books." },
  { key: `${K}.costs.items`, group: G, label: "Costs: list", value: "After hours | Calls after 6 pm go to voicemail, and most callers do not leave a message. They ring the next company on the list.\nSlow quotes | A quote sent two days later competes with one sent the same evening, and usually loses.\nNo second ask | A customer who did not book the first time is rarely contacted again.\nFew reviews | Happy customers leave reviews when asked at the right moment. Without the ask, most reviews come from the unhappy ones.", helpText: "One per line: the problem, a vertical bar, then the note." },
  { key: `${K}.calc.heading`, group: G, label: "Calculator: heading", value: "Put in your own numbers" },
  { key: `${K}.calc.callsLabel`, group: G, label: "Calculator: calls slider", value: "Calls you miss in a week" },
  { key: `${K}.calc.valueLabel`, group: G, label: "Calculator: job value slider", value: "Your average job" },
  { key: `${K}.calc.currency`, group: G, label: "Calculator: currency sign", value: "$", helpText: "Shown before every amount in the calculator." },
  { key: `${K}.calc.resultLabel`, group: G, label: "Calculator: result label", value: "Work that goes to someone else in a year" },
  { key: `${K}.calc.note`, group: G, label: "Calculator: note", value: "A rough sum, not a promise: missed calls, times 52 weeks, times your average job, halved because not every caller would have booked." },

  // System flow
  { key: `${K}.flow.kicker`, group: G, label: "System: label", value: "The system we set up" },
  { key: `${K}.flow.heading`, group: G, label: "System: heading", value: "From a search at 9:38 pm to a review the next day." },
  { key: `${K}.flow.sub`, group: G, label: "System: sub", value: "Seven steps, set up once, running every day without anyone at a desk. Follow one job through." },
  { key: `${K}.flow.items`, group: G, label: "System: steps", value: "Search | A homeowner searches on their phone. Your Google listing shows up with recent reviews and a link to book. | water heater leaking near me | 9:38 pm\nWebsite | Your site loads in under two seconds and puts the call and booking buttons first. | Book a visit | 9:39 pm\nRequest | They fill in a short form: the job, the address, a photo of the problem. | Water heater leaking in the garage | 9:41 pm\nInstant text reply | A text goes back within a minute, even at night, with a time to accept. | We can be there tomorrow between 8 and 10 am. Reply YES to book. | 9:41 pm\nBooking | The visit lands in your calendar. The customer gets a confirmation now and a reminder the evening before. | Tue, 8:00 am | 9:42 pm\nJob | Your tech sees the job, the address and the photo before setting off, so the van has the right part. | Dan, van 2 | Tue, 7:30 am\nReview request | Two hours after the job, a text thanks the customer and asks for a Google review with a direct link. | Thanks for having us, Mike. Would you leave us a review? | Tue, 12:10 pm", helpText: "Seven lines, in this order (each has its own picture): the step, a vertical bar, what happens, a vertical bar, what the customer sees, a vertical bar, the time." },
  { key: `${K}.flow.business`, group: G, label: "System: example business", value: "Lone Star Plumbing" },
  { key: `${K}.flow.customer`, group: G, label: "System: example customer", value: "Mike R." },
  { key: `${K}.flow.caption`, group: G, label: "System: caption", value: "An example. The business, the customer and the times are made up." },
  { key: `${K}.flow.stepLabel`, group: G, label: "System: step counter word", value: "Step" },
  { key: `${K}.flow.reply`, group: G, label: "System: customer's reply", value: "YES" },
  { key: `${K}.flow.bookedLabel`, group: G, label: "System: booked label", value: "Booked" },
  { key: `${K}.flow.reviewLink`, group: G, label: "System: review link text", value: "Leave a review" },

  // Trades
  { key: `${K}.trades.kicker`, group: G, label: "Trades: label", value: "Trades" },
  { key: `${K}.trades.heading`, group: G, label: "Trades: heading", value: "One thing we would set up first, by trade." },
  { key: `${K}.trades.sub`, group: G, label: "Trades: sub", value: "Every trade runs a little differently. These are starting points, not packages." },
  { key: `${K}.trades.items`, group: G, label: "Trades: list", value: "Plumbing | Emergency requests after hours get a text back in under a minute, with a time to accept.\nHVAC | Service plan reminders go out by text each spring and autumn, with a link to book the visit.\nRoofing | A storm-season page and a quote form that asks for photos of the damage before anyone climbs a ladder.\nElectrical | A request form that sorts small jobs from rewires, so you call back the right customers first.\nCleaning | Recurring bookings that customers can move themselves, without ringing the office.\nLandscaping | Seasonal packages with before-and-after photos, and quotes that follow up on their own after three days.\nPest control | Follow-up treatments booked automatically at the right interval for the pest.\nGarage doors | A same-day request form that asks for the door model and the fault, so the van carries the part.", helpText: "One per line: the trade, a vertical bar, then the example." },

  // Packages
  { key: `${K}.packages.kicker`, group: G, label: "Packages: label", value: "Packages" },
  { key: `${K}.packages.heading`, group: G, label: "Packages: heading", value: "Three ways to start. Fixed prices." },
  { key: `${K}.packages.sub`, group: G, label: "Packages: sub", value: "These are starting points. You get an exact figure in writing after a 30-minute call, and it does not change unless the work does." },
  { key: `${K}.packages.items`, group: G, label: "Packages: list", value: "Starter | from $1,500 | one-off | For a business with no website, or one that does not work on a phone. | A website built for phones; Google Business Profile set up and tidied; Call and request buttons on every page; Local SEO for your service area; 30 days of fixes\nBooking system | from $3,500 | one-off | For a business that has a website but loses requests after hours. | Everything in Starter; Online booking tied to your calendar; A text reply to every new request within a minute; Quote follow-ups and visit reminders; Review requests after each job; A simple CRM for your jobs\nFull growth | from $3,500 | then from $1,400 a month | For a business ready to spend on being found. | Everything in Booking system; Monthly video and photos of your real work; Social posts every week; Google and Meta ads, managed; A monthly report on booked jobs, not clicks", helpText: "One per line: name | price | how it is paid | who it is for | what is included, separated by semicolons." },
  { key: `${K}.packages.suggested`, group: G, label: "Packages: suggested package", value: "Booking system", helpText: "The package name to mark as our suggestion. Leave empty to mark none." },
  { key: `${K}.packages.suggestedLabel`, group: G, label: "Packages: suggestion tag", value: "Where we would start most" },
  { key: `${K}.packages.includedLabel`, group: G, label: "Packages: list label", value: "What's included" },
  { key: `${K}.packages.cta`, group: G, label: "Packages: button", value: "Ask for a fixed price" },

  // Why a new studio
  { key: `${K}.why.kicker`, group: G, label: "Why us: label", value: "Why a new studio" },
  { key: `${K}.why.heading`, group: G, label: "Why us: heading", value: "We have no home service clients yet. So we take the risk instead of you." },
  { key: `${K}.why.sub`, group: G, label: "Why us: sub", value: "We have built websites, products and video for ourselves and for others. The home service work on this site is labelled as a concept. Here is what we put in writing to make up for that." },
  { key: `${K}.why.items`, group: G, label: "Why us: list", value: "Free review | A short video with the three things we would fix first, before you spend anything.\nFixed price | One figure in writing before we start. No hourly billing, no surprise invoices.\n30 days of fixes | After launch, included in the price.\nYou own everything | The domain, the code, the content and every account are in your name from day one.\nNo long contracts | Monthly work runs month to month and stops when you say so.", helpText: "One per line: the promise, a vertical bar, then the detail." },

  // Concept teaser
  { key: `${K}.concept.kicker`, group: G, label: "Concept: label", value: "A worked example" },
  { key: `${K}.concept.heading`, group: G, label: "Concept: heading", value: "See the whole system built for a made-up plumber." },
  { key: `${K}.concept.tag`, group: G, label: "Concept: tag", value: "Concept" },
  { key: `${K}.concept.note`, group: G, label: "Concept: note", value: "A concept, not a client. Built to show how we would approach a plumbing company, with targets instead of results." },
  { key: `${K}.concept.link`, group: G, label: "Concept: link", value: "See the concept" },
  { key: `${K}.concept.cursor`, group: G, label: "Concept: cursor label", value: "Open" },

  // FAQ
  { key: `${K}.faq.kicker`, group: G, label: "FAQ: label", value: "Questions" },
  { key: `${K}.faq.heading`, group: G, label: "FAQ: heading", value: "What trade owners ask us." },
  { key: `${K}.faq.items`, group: G, label: "FAQ: list", value: "Do I need a new website, or can you fix mine? | If your site works on a phone and loads quickly, we keep it and add booking and follow-up. The free review tells you which.\nWill this work with the software I already use? | Often, yes. We connect to your calendar and job software where they allow it, and the written plan says so plainly if one does not.\nHow do the text replies work? | A new request from your website, or a missed call, gets a text back within a minute from a local number, with a time to accept. You see every message and can step in at any point.\nDo you work with businesses in the UK, Canada and Australia? | Yes. Phone numbers, listings and prices are set up for your country, and calls are booked in your time zone.\nWhat if I only want the website? | Then we build the website. Booking, follow-up and content can come later, or never.\nHow long until it is live? | Most websites go live two to four weeks after the plan is agreed. Booking and follow-up add one to two weeks.", helpText: "One per line: the question, a vertical bar, then the answer." },

  // Closing
  { key: `${K}.cta.heading`, group: G, label: "Closing: heading", value: "Find out what a customer sees when they search for you." },
  { key: `${K}.cta.sub`, group: G, label: "Closing: sub", value: "Send us your website or business name. Within a day we send a short video with the three things we would fix first. Free, and no call needed." },
  { key: `${K}.cta.button`, group: G, label: "Closing: main button", value: "Get a free website review" },
  { key: `${K}.cta.secondary`, group: G, label: "Closing: second button", value: "See all services" },
];
