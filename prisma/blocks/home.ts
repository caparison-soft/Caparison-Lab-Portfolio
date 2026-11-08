import type { Block } from "./types";

/**
 * Light redesign (owner, 2026-11-05): navigation, footer and the home page.
 * Positioning: websites, booking, follow-up and content for home service
 * businesses in the US, UK, Canada and Australia. Plain, specific, honest:
 * the studio has no home service clients yet and says so.
 */
export const blocks: Block[] = [
  // Navigation
  { key: "nav.home", group: "Navigation", label: "Home link", value: "Home" },
  { key: "nav.services", group: "Navigation", label: "Services link", value: "Services" },
  { key: "nav.homeServices", group: "Navigation", label: "Home services link", value: "Home services" },
  { key: "nav.work", group: "Navigation", label: "Work link", value: "Work" },
  { key: "nav.about", group: "Navigation", label: "About link", value: "About" },
  { key: "nav.pricing", group: "Navigation", label: "Pricing link", value: "Pricing", helpText: "Goes to the pricing on the home page." },
  { key: "nav.contact", group: "Navigation", label: "Contact link", value: "Contact" },
  { key: "nav.cta", group: "Navigation", label: "Header button", value: "Let's talk", helpText: "The one action in the header. Opens the contact page." },
  { key: "cursor.view", group: "Navigation", label: "Cursor label over projects", value: "View", helpText: "Shown inside the cursor when it is over a project card." },

  // Footer
  { key: "footer.heading", group: "Footer", label: "Footer heading", value: "Your work is good. Let's make it easy to find and book." },
  { key: "footer.sub", group: "Footer", label: "Footer sub", value: "Tell us about your business. We reply within one working day." },
  { key: "footer.pagesLabel", group: "Footer", label: "Pages column label", value: "Pages" },
  { key: "footer.reachLabel", group: "Footer", label: "Links column label", value: "Elsewhere" },
  { key: "footer.whatsappLabel", group: "Footer", label: "WhatsApp link", value: "WhatsApp" },
  { key: "footer.timeLabel", group: "Footer", label: "Clock label", value: "Our time" },
  { key: "footer.timeZone", group: "Footer", label: "Clock time zone", value: "Asia/Dhaka", helpText: "An IANA zone name, e.g. Asia/Dhaka." },
  { key: "footer.tagline", group: "Footer", label: "Tagline", value: "Websites, booking and growth for home service businesses." },

  // Hero
  { key: "home.hero.status", group: "Homepage", label: "Hero: availability pill", value: "Taking on 2 home service businesses this month" },
  { key: "home.hero.title", group: "Homepage", label: "Hero: headline", value: "Your business has *more potential.* Let's *unl{lock}ck* it.", helpText: "Words between asterisks are Bright Leaf. {lock} draws the open padlock in place of a letter." },
  { key: "home.hero.lead", group: "Homepage", label: "Hero: sub", value: "From online presence to marketing, one team that grows your business.", helpText: "One short line." },
  { key: "home.hero.cta", group: "Homepage", label: "Hero: main button", value: "Free website review" },
  { key: "home.hero.ctaSecondary", group: "Homepage", label: "Hero: second button", value: "See the work" },
  { key: "home.hero.proof", group: "Homepage", label: "Hero: three promises", value: "Reply within one working day\nFixed price before we start\nCalls in your time zone", helpText: "One per line, three lines." },

  // Hero demo (the animated system on the right)
  { key: "home.demo.business", group: "Homepage demo", label: "Example business name", value: "Lone Star Plumbing" },
  { key: "home.demo.caption", group: "Homepage demo", label: "Caption under the demo", value: "An example of what we set up. The business and the numbers are made up." },
  { key: "home.demo.reqLabel", group: "Homepage demo", label: "Request card: label", value: "New job request" },
  { key: "home.demo.reqTitle", group: "Homepage demo", label: "Request card: job", value: "Water heater leaking" },
  { key: "home.demo.reqName", group: "Homepage demo", label: "Request card: customer", value: "Mike R." },
  { key: "home.demo.reqPlace", group: "Homepage demo", label: "Request card: place", value: "Austin, TX" },
  { key: "home.demo.reqTime", group: "Homepage demo", label: "Request card: time", value: "9:41 pm" },
  { key: "home.demo.reqSource", group: "Homepage demo", label: "Request card: source", value: "From your website" },
  { key: "home.demo.smsLabel", group: "Homepage demo", label: "Text card: label", value: "Sent automatically, 40 seconds later" },
  { key: "home.demo.smsOut", group: "Homepage demo", label: "Text card: our message", value: "Hi Mike, it's Lone Star Plumbing. We can be there tomorrow between 8 and 10 am. Reply YES to book." },
  { key: "home.demo.smsIn", group: "Homepage demo", label: "Text card: reply", value: "YES" },
  { key: "home.demo.bookLabel", group: "Homepage demo", label: "Booking card: label", value: "Booked" },
  { key: "home.demo.bookValue", group: "Homepage demo", label: "Booking card: slot", value: "Tue, 8:00 am" },
  { key: "home.demo.statsLabel", group: "Homepage demo", label: "Stats card: label", value: "Jobs booked this week" },
  { key: "home.demo.statsValue", group: "Homepage demo", label: "Stats card: number", value: "23" },
  { key: "home.demo.statsNote", group: "Homepage demo", label: "Stats card: note", value: "9 came in after hours" },
  { key: "home.demo.reviewLabel", group: "Homepage demo", label: "Review card: label", value: "Review request sent" },
  { key: "home.demo.reviewNote", group: "Homepage demo", label: "Review card: note", value: "2 hours after the job" },

  // Hero orbit (owner, 2026-11-07): the six services circling the headline.
  // Each opens a card on hover, focus or tap. The card pictures use made-up
  // numbers and say so (home.orbit.example).
  { key: "home.orbit.label", group: "Homepage", label: "Orbit: name (screen readers)", value: "What we do" },
  { key: "home.orbit.seeHow", group: "Homepage", label: "Orbit: card link", value: "See how" },
  { key: "home.orbit.example", group: "Homepage", label: "Orbit: example note", value: "Example", helpText: "A small tag on each card picture: the numbers are made up." },
  { key: "home.orbit.close", group: "Homepage", label: "Orbit: close (phones)", value: "Close" },
  { key: "home.orbit.websites.name", group: "Homepage", label: "Orbit: Websites: name", value: "Websites" },
  { key: "home.orbit.websites.pitch", group: "Homepage", label: "Orbit: Websites: one line", value: "A fast site that shows up on Google and takes bookings at 11 pm." },
  { key: "home.orbit.websites.items", group: "Homepage", label: "Orbit: Websites: what we do", value: "Design and build, mobile first\nGoogle Business profile and local SEO\nOnline booking and quote forms", helpText: "One per line, three lines." },
  { key: "home.orbit.websites.price", group: "Homepage", label: "Orbit: Websites: price", value: "from $1,500" },
  { key: "home.orbit.websites.visual", group: "Homepage", label: "Orbit: Websites: card picture text", value: "lonestarplumbing.com\nBurst pipe? There in an hour.\nBook a visit", helpText: "One per line: The address bar, the headline, the button." },
  { key: "home.orbit.automation.name", group: "Homepage", label: "Orbit: AI automation: name", value: "AI automation" },
  { key: "home.orbit.automation.pitch", group: "Homepage", label: "Orbit: AI automation: one line", value: "Every missed call gets a text back in seconds, and the customer books without calling again." },
  { key: "home.orbit.automation.items", group: "Homepage", label: "Orbit: AI automation: what we do", value: "Missed call text back\nReminders and follow-ups\nReview requests after each job", helpText: "One per line, three lines." },
  { key: "home.orbit.automation.price", group: "Homepage", label: "Orbit: AI automation: price", value: "from $2,000" },
  { key: "home.orbit.automation.visual", group: "Homepage", label: "Orbit: AI automation: card picture text", value: "9:41 pm, 4 seconds after a missed call\nSorry we missed you. Tuesday?\nYes, 10 am please\nBooked Tue 10:00", helpText: "One per line: The time line, our text, their reply, the booking." },
  { key: "home.orbit.crm.name", group: "Homepage", label: "Orbit: CRM and dashboard: name", value: "CRM and dashboard" },
  { key: "home.orbit.crm.pitch", group: "Homepage", label: "Orbit: CRM and dashboard: one line", value: "Every lead, quote, job and invoice in one place, and the week's numbers on one screen." },
  { key: "home.orbit.crm.items", group: "Homepage", label: "Orbit: CRM and dashboard: what we do", value: "Lead and job pipeline\nQuotes and invoices\nWeekly numbers dashboard", helpText: "One per line, three lines." },
  { key: "home.orbit.crm.price", group: "Homepage", label: "Orbit: CRM and dashboard: price", value: "from $2,000" },
  { key: "home.orbit.crm.visual", group: "Homepage", label: "Orbit: CRM and dashboard: card picture text", value: "$18,420 booked in November\nNew 3\nQuoted 2\nBooked 4\nPaid 6", helpText: "One per line: The total, then four column labels." },
  { key: "home.orbit.pipeline.name", group: "Homepage", label: "Orbit: Content pipeline: name", value: "Content pipeline" },
  { key: "home.orbit.pipeline.pitch", group: "Homepage", label: "Orbit: Content pipeline: one line", value: "We plan, write and post every week, so your pages stay active without you thinking about it." },
  { key: "home.orbit.pipeline.items", group: "Homepage", label: "Orbit: Content pipeline: what we do", value: "Monthly content calendar\nCaptions, posts and scheduling\nGoogle posts and review replies", helpText: "One per line, three lines." },
  { key: "home.orbit.pipeline.price", group: "Homepage", label: "Orbit: Content pipeline: price", value: "from $800 a month" },
  { key: "home.orbit.pipeline.visual", group: "Homepage", label: "Orbit: Content pipeline: card picture text", value: "This week, 3 posts scheduled\nMon\nTue\nWed\nThu\nFri\nSat\nSun", helpText: "One per line: The summary, then the seven day names." },
  { key: "home.orbit.production.name", group: "Homepage", label: "Orbit: Content production: name", value: "Content production" },
  { key: "home.orbit.production.pitch", group: "Homepage", label: "Orbit: Content production: one line", value: "Short videos and photos of your real jobs, cut into reels, ads and pictures for your site." },
  { key: "home.orbit.production.items", group: "Homepage", label: "Orbit: Content production: what we do", value: "Shot lists for each job\nReels and ad cuts\nPhotos for the site and Google", helpText: "One per line, three lines." },
  { key: "home.orbit.production.price", group: "Homepage", label: "Orbit: Content production: price", value: "from $800 a month" },
  { key: "home.orbit.production.visual", group: "Homepage", label: "Orbit: Content production: card picture text", value: "Burst pipe, 40 second reel\n00:14", helpText: "One per line: The clip name, then the time code." },
  { key: "home.orbit.ads.name", group: "Homepage", label: "Orbit: Ads and marketing: name", value: "Ads and marketing" },
  { key: "home.orbit.ads.pitch", group: "Homepage", label: "Orbit: Ads and marketing: one line", value: "Google, Local Services and Meta ads for your area, reported by what each booked job cost." },
  { key: "home.orbit.ads.items", group: "Homepage", label: "Orbit: Ads and marketing: what we do", value: "Google and Local Services ads\nMeta ads and landing pages\nCall tracking and a monthly report", helpText: "One per line, three lines." },
  { key: "home.orbit.ads.price", group: "Homepage", label: "Orbit: Ads and marketing: price", value: "from $600 a month" },
  { key: "home.orbit.ads.visual", group: "Homepage", label: "Orbit: Ads and marketing: card picture text", value: "Leads this week\n31\n$38 per booked job", helpText: "One per line: The label, the number, the cost." },

  // "What we build" (owner, 2026-11-07, after the live site's capability slider):
  // the six services as hover titles beside a moving picture.
  { key: "home.build.heading", group: "Homepage", label: "What we build: heading", value: "What we build." },
  { key: "home.build.link", group: "Homepage", label: "What we build: link under each service", value: "See prices", helpText: "Goes to the pricing section." },
  { key: "home.orbit.websites.timeline", group: "Homepage", label: "Orbit: Websites: timeline", value: "2 to 4 weeks" },
  { key: "home.orbit.websites.media", group: "Homepage", label: "Orbit: Websites: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },
  { key: "home.orbit.automation.timeline", group: "Homepage", label: "Orbit: AI automation: timeline", value: "1 to 3 weeks" },
  { key: "home.orbit.automation.media", group: "Homepage", label: "Orbit: AI automation: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },
  { key: "home.orbit.crm.timeline", group: "Homepage", label: "Orbit: CRM and dashboard: timeline", value: "3 to 6 weeks" },
  { key: "home.orbit.crm.media", group: "Homepage", label: "Orbit: CRM and dashboard: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },
  { key: "home.orbit.pipeline.timeline", group: "Homepage", label: "Orbit: Content pipeline: timeline", value: "Every month" },
  { key: "home.orbit.pipeline.media", group: "Homepage", label: "Orbit: Content pipeline: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },
  { key: "home.orbit.production.timeline", group: "Homepage", label: "Orbit: Content production: timeline", value: "Every month" },
  { key: "home.orbit.production.media", group: "Homepage", label: "Orbit: Content production: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },
  { key: "home.orbit.ads.timeline", group: "Homepage", label: "Orbit: Ads and marketing: timeline", value: "Every month" },
  { key: "home.orbit.ads.media", group: "Homepage", label: "Orbit: Ads and marketing: moving picture link", value: "", type: "URL", helpText: "A GIF, or an .mp4 or .webm link (plays muted on a loop). Empty shows the drawn demo." },

  // Video testimonials after the logo strip (owner, 2026-11-07). Clients of the
  // studio's video work, in their own words; quotes are kept as given.
  { key: "home.voices.heading", group: "Homepage", label: "Testimonials: heading", value: "In their own words." },
  { key: "home.voices.sub", group: "Homepage", label: "Testimonials: line", value: "What clients of our video work say about working with us." },
  { key: "home.voices.play", group: "Homepage", label: "Testimonials: play button (screen readers)", value: "Play the video from {name}", helpText: "{name} is replaced with the person's name." },
  { key: "home.voices.t1.name", group: "Homepage", label: "Testimonial 1: name", value: "Ashwin Van Kampen" },
  { key: "home.voices.t1.role", group: "Homepage", label: "Testimonial 1: role", value: "Founder, AVK Media" },
  { key: "home.voices.t1.video", group: "Homepage", label: "Testimonial 1: Vimeo player link", value: "https://player.vimeo.com/video/1226358946?h=ed2b445c1d", type: "URL", helpText: "The player.vimeo.com link from Vimeo's embed code, with its h= part." },
  { key: "home.voices.t1.poster", group: "Homepage", label: "Testimonial 1: thumbnail link", value: "https://i.vimeocdn.com/video/2200315531-317f144a17911f037bd297cd1a92e8084f40c27a2552140db2dc00531d8c08f2-d_1280?region=us", type: "URL" },
  { key: "home.voices.t1.quote", group: "Homepage", label: "Testimonial 1: quote", value: "I was looking for a video editing agency like Caparison Studio for a long time, and I finally found them. Good editing is easy to find. But a creative partner you can trust at scale is much harder." },
  { key: "home.voices.t2.name", group: "Homepage", label: "Testimonial 2: name", value: "Narado Powell" },
  { key: "home.voices.t2.role", group: "Homepage", label: "Testimonial 2: role", value: "Channel Owner, Narado Powell" },
  { key: "home.voices.t2.video", group: "Homepage", label: "Testimonial 2: Vimeo player link", value: "https://player.vimeo.com/video/1226359080?h=0062de1321", type: "URL", helpText: "The player.vimeo.com link from Vimeo's embed code, with its h= part." },
  { key: "home.voices.t2.poster", group: "Homepage", label: "Testimonial 2: thumbnail link", value: "https://i.vimeocdn.com/video/2200315645-b990a750300ec09450be9c25f67323425b7850dbeeebb73d6b5955a229d85a88-d_1280?region=us", type: "URL" },
  { key: "home.voices.t2.quote", group: "Homepage", label: "Testimonial 2: quote", value: "My channel has grown tremendously with the help of Caparison Studio. I love working with them. Their efforts are unmatched." },
  { key: "home.voices.t3.name", group: "Homepage", label: "Testimonial 3: name", value: "Paul Chen" },
  { key: "home.voices.t3.role", group: "Homepage", label: "Testimonial 3: role", value: "Channel Owner, Pablito's way" },
  { key: "home.voices.t3.video", group: "Homepage", label: "Testimonial 3: Vimeo player link", value: "https://player.vimeo.com/video/1226359087?h=db87dacb03", type: "URL", helpText: "The player.vimeo.com link from Vimeo's embed code, with its h= part." },
  { key: "home.voices.t3.poster", group: "Homepage", label: "Testimonial 3: thumbnail link", value: "https://i.vimeocdn.com/video/2200315668-0bb8928f48adf62fe3415968ee85ddcc9ad207ab8f9c629cc87b4f502996a9a5-d_1280?region=us", type: "URL" },
  { key: "home.voices.t3.quote", group: "Homepage", label: "Testimonial 3: quote", value: "I have been with Caparison Studio since 2024, and it’s been an actual pleasure since then. They took our raw footage and turned it into content that actually feels premium. I highly recommend them." },
  { key: "home.voices.t4.name", group: "Homepage", label: "Testimonial 4: name", value: "Anjelo Atienza" },
  { key: "home.voices.t4.role", group: "Homepage", label: "Testimonial 4: role", value: "Channel Owner, They will kill you" },
  { key: "home.voices.t4.video", group: "Homepage", label: "Testimonial 4: Vimeo player link", value: "https://player.vimeo.com/video/1226358945?h=d1cd5aa87f", type: "URL", helpText: "The player.vimeo.com link from Vimeo's embed code, with its h= part." },
  { key: "home.voices.t4.poster", group: "Homepage", label: "Testimonial 4: thumbnail link", value: "https://i.vimeocdn.com/video/2200315458-250e08e90260a07b3475ed76ada10d83670526139cb64b81ddccadfd39f43227-d_1280?region=us", type: "URL" },
  { key: "home.voices.t4.quote", group: "Homepage", label: "Testimonial 4: quote", value: "The special touch and creativity of Caparison Studio is hard to compare with others, especially considering their prices. We’re just really impressed with their output. I cannot recommend them enough." },
  { key: "home.voices.t5.name", group: "Homepage", label: "Testimonial 5: name", value: "Peter Deeley" },
  { key: "home.voices.t5.role", group: "Homepage", label: "Testimonial 5: role", value: "Channel Owner, Peter Deeley" },
  { key: "home.voices.t5.video", group: "Homepage", label: "Testimonial 5: Vimeo player link", value: "https://player.vimeo.com/video/1226359093?h=2359a23661", type: "URL", helpText: "The player.vimeo.com link from Vimeo's embed code, with its h= part." },
  { key: "home.voices.t5.poster", group: "Homepage", label: "Testimonial 5: thumbnail link", value: "https://i.vimeocdn.com/video/2200315639-bd319d44fd5e854160aaf65a9af1c218f73d0539b7c4ae48a1d271d3415bb695-d_1280?region=us", type: "URL" },
  { key: "home.voices.t5.quote", group: "Homepage", label: "Testimonial 5: quote", value: "My experience has been really amazing with caparison studio. Great Communication, Everything is on time and I am recommending them." },

  // Mission row and the statement with the rising phone (owner, 2026-11-07).
  { key: "home.mission.text", group: "Homepage", label: "Mission: paragraph", value: "Most home service businesses lose work they never hear about: *the call after 6 pm*, the quote nobody followed up, the customer who could not book on a phone. We fix that, and *show you what changed.*", helpText: "Words between asterisks are Bright Leaf." },
  { key: "home.mission.count", group: "Homepage", label: "Mission: count", value: "6 services" },
  { key: "home.mission.countNote", group: "Homepage", label: "Mission: count note", value: "One team, fixed prices" },
  { key: "home.mission.link", group: "Homepage", label: "Mission: button", value: "Explore our services" },
  // The small video card under the mission row (owner, 2026-11-07).
  { key: "home.video.label", group: "Homepage", label: "Video card: label", value: "Watch how we work" },
  { key: "home.video.url", group: "Homepage", label: "Video card: video link", value: "", type: "URL", helpText: "A YouTube or Vimeo link, or a direct .mp4 link. Leave empty until the video exists: the card then says it is on its way." },
  { key: "home.video.poster", group: "Homepage", label: "Video card: thumbnail link", value: "", type: "URL", helpText: "An image link for the small thumbnail. Empty shows the brand mark." },
  { key: "home.video.soon", group: "Homepage", label: "Video card: before the video exists", value: "The walkthrough video is on its way." },
  { key: "home.video.close", group: "Homepage", label: "Video card: close button", value: "Close the video" },
  { key: "home.video.play", group: "Homepage", label: "Video card: play button (reduced motion)", value: "Play the video" },
  { key: "home.statement.text", group: "Homepage", label: "Statement: text", value: "We build the *website* [img] set up the *booking,* edit the *video* [img] and run the *ads,* so the business you built gets the *customers it deserves.*", helpText: "Words between asterisks are Bright Leaf. [img] places a small picture from a featured project." },
  { key: "home.statement.cta", group: "Homepage", label: "Statement: button", value: "Explore our services" },
  { key: "home.statement.img1", group: "Homepage", label: "Statement: picture after 'website'", value: "", type: "URL", helpText: "An image link for the small picture after the first [img]. Empty uses a featured project's thumbnail." },
  { key: "home.statement.img2", group: "Homepage", label: "Statement: picture after 'video'", value: "", type: "URL", helpText: "An image link for the small picture after the second [img]. Empty uses a featured project's thumbnail." },
  // Logo strip after the statement (owner, 2026-11-07): brands the studio has
  // made videos for, from caparisonstudio.com. Files live in public/brand/clients.
  { key: "home.logos.label", group: "Homepage", label: "Logo strip: label", value: "Brands we have made videos for" },
  { key: "home.logos.items", group: "Homepage", label: "Logo strip: logos", value: "McInnes Group | mcinnes-group\nHotel Al Aqsa | al-aqsa\nWe Build Trades | we-build-trades\nOrigin GPH | origin-gph\nRed Tower Entertainment | red-tower\nAVK Media | avk-media\nBlue Ground | blue-ground\nDigital Wire BV | digital-wire\nLindsey Anderson | lindsey-anderson\nRemember When | remember-when", helpText: "One per line: the brand name, a vertical bar, then the file name in public/brand/clients (without .webp)." },
  { key: "home.statement.phone.day", group: "Homepage", label: "Statement phone: day", value: "Today" },
  { key: "home.statement.phone.business", group: "Homepage", label: "Statement phone: business", value: "Lone Star Plumbing" },
  { key: "home.statement.phone.headline", group: "Homepage", label: "Statement phone: headline", value: "7 jobs booked,\n3 after hours" },
  { key: "home.statement.phone.jobs", group: "Homepage", label: "Statement phone: jobs", value: "Water heater | Mike R. | 8:00\nLeaking tap | Dana K. | 10:30\nNew boiler quote | Sam T. | 13:00", helpText: "One per line: job, customer, time." },
  { key: "home.statement.phone.caller", group: "Homepage", label: "Statement phone: caller", value: "Caparison Lab" },
  { key: "home.statement.phone.callLabel", group: "Homepage", label: "Statement phone: call label", value: "Incoming call" },
  { key: "home.statement.phone.decline", group: "Homepage", label: "Statement phone: decline", value: "Decline" },
  { key: "home.statement.phone.accept", group: "Homepage", label: "Statement phone: accept", value: "Accept" },
  { key: "home.statement.phone.booked", group: "Homepage", label: "Statement phone: booked card", value: "Booked | Water heater, Tue 8:00", helpText: "Title, a vertical bar, then the line under it." },
  { key: "home.statement.phone.rating", group: "Homepage", label: "Statement phone: rating", value: "4.9 | from 128 reviews", helpText: "The score, a vertical bar, then the line beside it." },
  { key: "home.statement.note", group: "Homepage", label: "Statement: example note", value: "Example screen. Lone Star Plumbing is a concept, not a client." },

  // The crowd story above the footer (owner, 2026-11-07, from the earlier
  // prototype): a business people walk past, a call to us, the pieces we set
  // up, then the crowd walks in.
  { key: "home.crowd.label", group: "Homepage", label: "Crowd story: name (screen readers)", value: "What changes when you work with us" },
  { key: "home.crowd.captions", group: "Homepage", label: "Crowd story: captions", value: "Today: people walk right past your business.\nYou call us. We start with a free review.\nWe set up what is missing, one piece at a time.\nNow they walk in.", helpText: "Four lines, one per step of the story." },
  { key: "home.crowd.sign", group: "Homepage", label: "Crowd story: shop sign", value: "YOUR BUSINESS" },
  { key: "home.crowd.open", group: "Homepage", label: "Crowd story: window tag", value: "OPEN" },
  { key: "home.crowd.ask", group: "Homepage", label: "Crowd story: owner's question", value: "Can you help us get more customers?" },
  { key: "home.crowd.reply", group: "Homepage", label: "Crowd story: our answer", value: "Yes. Let's start with a free review." },

  // Marquee
  { key: "home.marquee", group: "Homepage", label: "Moving band: words", value: "Websites\nOnline booking\nCRM\nAI chat\nAutomation\nVideo\nSocial content\nAds\nLocal SEO", helpText: "One per line." },

  // Problems
  { key: "home.problems.kicker", group: "Homepage", label: "Problems: label", value: "Where the work goes" },
  { key: "home.problems.heading", group: "Homepage", label: "Problems: heading", value: "A good business can still lose the job online." },
  { key: "home.problems.items", group: "Homepage", label: "Problems: list", value: "After 6 pm, calls go to voicemail. | The caller rarely leaves a message. They ring the next company on the list.\nThe website is hard to use on a phone. | Your customer is searching on a phone, often with water on the kitchen floor.\nFollow-ups live in someone's head. | Quotes go out late, or not at all, when the follow-up depends on remembering.\nReviews mostly come from unhappy customers. | Happy customers leave reviews when they are asked at the right moment, and rarely otherwise.\nThe social pages went quiet two years ago. | A page with no recent posts reads like a business that closed.", helpText: "One per line: the problem, a vertical bar, then the note." },

  // Services
  { key: "home.services.kicker", group: "Homepage", label: "Services: label", value: "What we do" },
  { key: "home.services.heading", group: "Homepage", label: "Services: heading", value: "Four things we set up. One team does all of it." },
  { key: "home.services.sub", group: "Homepage", label: "Services: sub", value: "No need to hire a web designer, a developer, a video editor and an ad agency, then get them talking to each other. Start with what you need now and add the rest later." },
  { key: "home.services.fromLabel", group: "Homepage", label: "Services: price prefix", value: "from" },
  { key: "home.services.allLink", group: "Homepage", label: "Services: all link", value: "See every service" },

  // Industry teaser
  { key: "home.industry.kicker", group: "Homepage", label: "Industry: label", value: "Who we work with first" },
  { key: "home.industry.heading", group: "Homepage", label: "Industry: heading", value: "Built for home service businesses." },
  { key: "home.industry.sub", group: "Homepage", label: "Industry: sub", value: "Trades that run on the phone and in the van. Pick yours to see one thing we would set up first." },
  { key: "home.industry.trades", group: "Homepage", label: "Industry: trades", value: "Plumbing | Emergency calls after hours get a text back in under a minute, with a link to book.\nHVAC | Maintenance plan reminders go out by text every spring and autumn.\nRoofing | A storm-season landing page and a quote form that asks for photos of the damage.\nElectrical | A request form that separates small jobs from rewires before you call back.\nCleaning | Recurring bookings that customers can move themselves, without ringing you.\nLandscaping | Seasonal packages with before-and-after photos, and quotes that follow up on their own.\nPest control | Follow-up visits booked automatically at the right interval.\nGarage doors | A same-day request form that asks for the model and the fault, so the van has the part.", helpText: "One per line: the trade, a vertical bar, then the example." },
  { key: "home.industry.cta", group: "Homepage", label: "Industry: link", value: "How it works for home services" },

  // Work
  { key: "home.work.kicker", group: "Homepage", label: "Work: label", value: "Work" },
  { key: "home.work.heading", group: "Homepage", label: "Work: heading", value: "Things we have built." },
  { key: "home.work.sub", group: "Homepage", label: "Work: sub", value: "Our own products, and concept builds for businesses like yours. Every project says which it is." },
  { key: "home.work.allLink", group: "Homepage", label: "Work: all link", value: "All work" },
  { key: "home.work.tabAll", group: "Homepage", label: "Work: first filter tab", value: "Everything", helpText: "The tab that shows every featured project. The other tabs are the projects' categories." },
  // Videos in the work section (owner, 2026-11-07): each its own card, under
  // Everything and Video production; a card opens the video in a popup.
  { key: "home.work.videoTab", group: "Homepage", label: "Work: video tab", value: "Video production" },
  { key: "home.work.videoPlay", group: "Homepage", label: "Work: play video (screen readers)", value: "Play {title}", helpText: "{title} is replaced with the video's title." },
  { key: "home.work.videoClose", group: "Homepage", label: "Work: close video", value: "Close the video" },
  { key: "home.work.v1.title", group: "Homepage", label: "Work video 1: title", value: "Stallion Project sales video" },
  { key: "home.work.v1.summary", group: "Homepage", label: "Work video 1: line", value: "A five-minute sales video, edited for Stallion Project." },
  { key: "home.work.v1.video", group: "Homepage", label: "Work video 1: Vimeo player link", value: "https://player.vimeo.com/video/1244642590", type: "URL" },
  { key: "home.work.v1.poster", group: "Homepage", label: "Work video 1: thumbnail link", value: "https://i.vimeocdn.com/video/2223464176-04a6310bf525036281afaf28a9bcd03746bb2382b4e83c9cd3358e4757c8aedc-d_1280?region=us", type: "URL" },
  { key: "home.work.v1.ratio", group: "Homepage", label: "Work video 1: shape", value: "16:9", helpText: "Width:height, e.g. 16:9, 9:16 or 4:5." },
  { key: "home.work.v2.title", group: "Homepage", label: "Work video 2: title", value: "Pest control ad" },
  { key: "home.work.v2.summary", group: "Homepage", label: "Work video 2: line", value: "A 30-second vertical ad for a pest control company." },
  { key: "home.work.v2.video", group: "Homepage", label: "Work video 2: Vimeo player link", value: "https://player.vimeo.com/video/1244642592", type: "URL" },
  { key: "home.work.v2.poster", group: "Homepage", label: "Work video 2: thumbnail link", value: "https://i.vimeocdn.com/video/2223463858-aa33f2451713b9e00aeec0b84b1740120cdf9bc29839d83de93020d7dffe5067-d_1280?region=us", type: "URL" },
  { key: "home.work.v2.ratio", group: "Homepage", label: "Work video 2: shape", value: "9:16", helpText: "Width:height, e.g. 16:9, 9:16 or 4:5." },
  { key: "home.work.v3.title", group: "Homepage", label: "Work video 3: title", value: "Trader Gang demo video" },
  { key: "home.work.v3.summary", group: "Homepage", label: "Work video 3: line", value: "A one-minute vertical demo video, edited for Trader Gang." },
  { key: "home.work.v3.video", group: "Homepage", label: "Work video 3: Vimeo player link", value: "https://player.vimeo.com/video/1244641625", type: "URL" },
  { key: "home.work.v3.poster", group: "Homepage", label: "Work video 3: thumbnail link", value: "https://i.vimeocdn.com/video/2223462355-aa190c87de36e5ee48a76688cd42e7ced077a5b3a5813b26eee246775146cb37-d_1280?region=us", type: "URL" },
  { key: "home.work.v3.ratio", group: "Homepage", label: "Work video 3: shape", value: "9:16", helpText: "Width:height, e.g. 16:9, 9:16 or 4:5." },
  { key: "home.work.v4.title", group: "Homepage", label: "Work video 4: title", value: "Origin GPH client shorts" },
  { key: "home.work.v4.summary", group: "Homepage", label: "Work video 4: line", value: "Short client stories for Origin GPH, a gas, plumbing and heating company." },
  { key: "home.work.v4.video", group: "Homepage", label: "Work video 4: Vimeo player link", value: "https://player.vimeo.com/video/1244641626", type: "URL" },
  { key: "home.work.v4.poster", group: "Homepage", label: "Work video 4: thumbnail link", value: "https://i.vimeocdn.com/video/2223462495-981e1c95d628aba2953bb587400f7fd80c514651bbc5e1ff5350324bb1de8f75-d_1280?region=us", type: "URL" },
  { key: "home.work.v4.ratio", group: "Homepage", label: "Work video 4: shape", value: "4:5", helpText: "Width:height, e.g. 16:9, 9:16 or 4:5." },
  { key: "work.kind.client", group: "Work", label: "Kind label: client", value: "Client project" },
  { key: "work.kind.internal", group: "Work", label: "Kind label: our product", value: "Our product" },
  { key: "work.kind.concept", group: "Work", label: "Kind label: concept", value: "Concept" },
  { key: "work.kind.conceptNote", group: "Work", label: "Concept note on case pages", value: "This is a concept: a worked example for a made-up business, built to show how we would approach it. It is not a client result, and any numbers on it are targets, not measurements." },
  { key: "work.kind.internalNote", group: "Work", label: "Our-product note on case pages", value: "This is one of our own products. We designed, built and run it ourselves." },

  // Process
  { key: "home.process.kicker", group: "Homepage", label: "Process: label", value: "How it works" },
  { key: "home.process.heading", group: "Homepage", label: "Process: heading", value: "From a free review to booked jobs, in five steps." },

  // Pricing (owner, 2026-11-07): three monthly partner packages.
  { key: "home.pricing.heading", group: "Homepage", label: "Pricing: heading", value: "Monthly partner packages." },
  { key: "home.pricing.sub", group: "Homepage", label: "Pricing: line", value: "One team for your content, marketing and operations. A fixed monthly price, agreed before we start." },
  { key: "home.pricing.period", group: "Homepage", label: "Pricing: price period", value: "a month" },
  { key: "home.pricing.cta", group: "Homepage", label: "Pricing: button", value: "Let's talk" },
  { key: "home.pricing.included", group: "Homepage", label: "Pricing: list label", value: "What's included" },
  { key: "home.pricing.p1.label", group: "Homepage", label: "Pricing 1: label", value: "Package 01" },
  { key: "home.pricing.p1.name", group: "Homepage", label: "Pricing 1: name", value: "Content Growth Partner" },
  { key: "home.pricing.p1.price", group: "Homepage", label: "Pricing 1: price", value: "$1,500–$2,000" },
  { key: "home.pricing.p1.for", group: "Homepage", label: "Pricing 1: who it is for", value: "For companies that need content every month." },
  { key: "home.pricing.p1.items", group: "Homepage", label: "Pricing 1: what is included", value: "12–16 short-form videos\n4–8 graphic and social posts\nVideo editing and motion graphics\nContent calendar\nSocial media scheduling\nMonthly performance report", helpText: "One per line." },
  { key: "home.pricing.p1.note", group: "Homepage", label: "Pricing 1: note", value: "Planned around the footage, images and brand assets you supply." },
  { key: "home.pricing.p2.label", group: "Homepage", label: "Pricing 2: label", value: "Package 02" },
  { key: "home.pricing.p2.name", group: "Homepage", label: "Pricing 2: name", value: "Growth & Marketing Partner" },
  { key: "home.pricing.p2.price", group: "Homepage", label: "Pricing 2: price", value: "$2,500–$3,500" },
  { key: "home.pricing.p2.for", group: "Homepage", label: "Pricing 2: who it is for", value: "For companies that want leads and content, every month." },
  { key: "home.pricing.p2.items", group: "Homepage", label: "Pricing 2: what is included", value: "16–20 short-form videos\n2–4 ad creatives\n8–12 social posts\nSocial media management\nMeta and Google Ads management\nLanding page optimization\nLead tracking and reporting\nMonthly strategy meeting", helpText: "One per line." },
  { key: "home.pricing.p2.note", group: "Homepage", label: "Pricing 2: note", value: "Ad spend is separate. A website redesign or filming is quoted separately." },
  { key: "home.pricing.p3.label", group: "Homepage", label: "Pricing 3: label", value: "Package 03" },
  { key: "home.pricing.p3.name", group: "Homepage", label: "Pricing 3: name", value: "Complete Digital Operations Partner" },
  { key: "home.pricing.p3.price", group: "Homepage", label: "Pricing 3: price", value: "$4,500–$6,000" },
  { key: "home.pricing.p3.for", group: "Homepage", label: "Pricing 3: who it is for", value: "For companies that want to hand over several digital functions." },
  { key: "home.pricing.p3.items", group: "Homepage", label: "Pricing 3: what is included", value: "Everything in Growth & Marketing Partner\nAdvanced video and ad production\nWebsite maintenance\nCRM integration\nLead management automation\nCustom dashboards\nBusiness workflow automation\nAdvanced reporting\nDedicated account management", helpText: "One per line." },
  { key: "home.pricing.p3.note", group: "Homepage", label: "Pricing 3: note", value: "Complex custom software is quoted as a separate project." },

  // Promises
  { key: "home.promises.kicker", group: "Homepage", label: "Promises: label", value: "What you can hold us to" },
  { key: "home.promises.heading", group: "Homepage", label: "Promises: heading", value: "We're new to your industry. So here is what we put in writing." },
  { key: "home.promises.items", group: "Homepage", label: "Promises: list", value: "1 day | Our reply time on every message, on working days.\n30 days | Of fixes after launch, included in the price.\n100% | Of the code, content and accounts are in your name.\n0 | Long contracts. Monthly work stops when you say so.", helpText: "One per line: the figure, a vertical bar, then what it means. Figures count up when seen." },

  // FAQ
  { key: "home.faq.kicker", group: "Homepage", label: "FAQ: label", value: "Questions" },
  { key: "home.faq.heading", group: "Homepage", label: "FAQ: heading", value: "What people ask before they hire us." },
  { key: "home.faq.askNote", group: "Homepage", label: "FAQ: assistant note", value: "Something else? Our assistant knows our services, prices and process, and answers straight away." },
  { key: "home.faq.askLabel", group: "Homepage", label: "FAQ: assistant button", value: "Ask the assistant" },

  // Closing CTA
  { key: "home.cta.heading", group: "Homepage", label: "Closing: heading", value: "Get a *free review* of your website and Google listing.", helpText: "Words between asterisks are Bright Leaf, with a line drawn under them." },
  { key: "home.cta.sub", group: "Homepage", label: "Closing: sub", value: "We look at what a customer sees when they search for you, then send a short video with the three things we would fix first. It takes us a day. It costs you nothing." },
  { key: "home.cta.secondary", group: "Homepage", label: "Closing: email link prefix", value: "Or write to" },

  // SEO
  { key: "meta.defaultDescription", group: "SEO", label: "Default description", value: "Websites, online booking, follow-up automation and content for home service businesses in the US, UK, Canada and Australia. Fixed prices, replies within one working day." },
];
