# Caparison Lab — Phase 0 design plan

Status: awaiting approval. No code until approved.

## Layout concept: the index

The site is organised like a repository you can scan: an orientation rail on
the left (the spine), a wide left-aligned content column, real metadata on
every item, and a clear path from summary to detail. Nothing is centred except
the 404 page.

### The spine
- 180 px sticky rail, present on every public page and in the admin.
- It is stateful, not decorative. It carries: the section marker for the
  section currently in view (lowercase, Satoshi 500), the availability dot and
  note from SiteSettings, a section index with the 2 px lime cursor on the
  active entry, and on the work section the hover thumbnail of the row under
  the pointer.
- On a case page it becomes the metadata column: back link, client, budget,
  duration, year, team size, stack, live link.
- Below 1024 px it collapses to a single non-sticky line under the nav
  (dot + availability note). Case-page metadata becomes a 2-column
  definition list between the summary and the cover.

### Surfaces
- Light-primary. bone is the page. paper is used for one raised band (process)
  and for panels (case CTA, form fields).
- Exactly two dark blocks on the homepage: the work index, and contact +
  footer as one continuous olive-950 block. The case page is fully light
  except the footer; the cover image carries the weight.
- Lime on light: fills with ink on top (primary button), the dot, the 2 px
  cursor rule. Lime as text only inside the two dark blocks.
- The signature gradient appears once per page: the hero hex mark on the
  homepage, the OG image elsewhere. Never behind text.

### Type usage
Mono (JetBrains Mono, .data): budget bands, durations, years, team size,
stack tags, the live-strip slug and week counter, metric values, process
step durations, admin timestamps and ids. Everything else is Satoshi:
titles, client names, section markers, column headers, nav, buttons.

### Radius by element
0: rows, table cells, the capability sheet, dividers. 4 px: inputs, tags,
small controls. 12 px: media frames, the case CTA panel, modals.
999: the dot, filter pills on /work.

## Hero treatment

Three-line display-xl headline, weight 900, in the content column. The hex
mark sits in its own right-hand column at full strength, about 640 px wide at
1440, with roughly 40 % bleeding off the right edge, clipped by the viewport.
The grid guarantees the mark and the headline never overlap. At 390 px the
mark is 180 px, clipped at the top-right corner above the headline.

Order in the column: headline, sub (body-l, ash, max 68ch), the two CTAs
(lime fill "Start a project", ghost "See the work"), then the live strip as a
hairline-topped bar at the foot of the hero. The strip is three mono columns
(slug, stack, progress) under a Satoshi label "currently building", and it
hands off into the dark work section directly below it.

Reveal (the only load animation on the site): headline lines rise 12 px and
fade in at 0 / 60 / 120 ms, each 560 ms ease-out; sub, CTAs and strip as one
group at 180 ms for 240 ms; the mark scales 0.97 to 1 over 560 ms from 0.
Everything settles by 680 ms. Reduced motion: all of it is visible at once.

## Homepage wireframe (1440)

```
┌ nav 56px ───────────────────────────────────────────────────────────────┐
│ Caparison.LAB    work   capabilities   about   contact                  │
├──────────┬────────────────────────────────────────────┬─────────────────┤
│ SPINE    │ HERO (bone)                                 │                 │
│          │                                             │    ┌────────────┤
│ ● avail- │ Scoped in a week.                           │    │  hex mark  │
│   able   │ Priced up front.                            │    │  gradient  │
│   for Q1 │ Shipped by week ten.                        │    │  bleeds    │
│          │                                             │    └────────────┤
│ 2 slots  │ Caparison Lab builds web and mobile apps    │                 │
│ open     │ for teams in Bangladesh and the Gulf. Every │                 │
│          │ project here lists what it cost and how     │                 │
│ index    │ long it took.                               │                 │
│ ▍work    │                                             │                 │
│  capab.. │ [ Start a project ]   See the work          │                 │
│  process │                                             │                 │
│  contact │ ─────────────────────────────────────────── │                 │
│          │ currently building                          │                 │
│          │ nexus-crm     react  node  postgres    wk 4 of 7              │
├──────────┼───────────────────────────────────────────────────────────────┤
│ work     │ project                client       budget      duration     │  DARK
│ 12 live  │ ───────────────────────────────────────────────────────────  │  olive-950
│          │▍Nexus CRM              Acme Ltd     $12k–18k    9 wk         │  full-width rows
│ ┌──────┐ │ Internal sales tooling for a 40-person team                  │  hairline dividers
│ │thumb │ │ react  postgres  aws                                         │  thumb appears in
│ │hover │ │ ───────────────────────────────────────────────────────────  │  the spine on hover
│ └──────┘ │ Orbit Booking          Orbit        $6k–9k      5 wk         │
│          │ ...                                                          │
│          │ All work (12)                                                │
├──────────┼───────────────────────────────────────────────────────────────┤
│ capabil- │ What we build                                                │  LIGHT, one sheet
│ ities    │ ┌──────────────────────────────┬──────────────┬─────────────┐│  shared hairlines
│          │ │ Web applications             │ Mobile apps  │ Automation  ││  zero gap
│          │ │ blurb                        │ blurb        │ blurb       ││  zero radius
│          │ │ deliverables                 │              │             ││  weight 3 spans
│          │ │ from $8k          6–10 wk    ├──────────────┴─────────────┤│  2 cols x 2 rows
│          │ │                              │ Design systems             ││
│          │ └──────────────────────────────┴────────────────────────────┘│
├──────────┼───────────────────────────────────────────────────────────────┤
│ process  │ 01 Scope     │ 02 Build      │ 03 Ship      │ 04 Iterate    │  paper band
│          │ week 1       │ weeks 2–8     │ week 9       │ after launch  │  short section
│          │ description  │ description   │ description  │ description   │  durations in mono
├──────────┼───────────────────────────────────────────────────────────────┤
│ 1 of 3   │ "One quote in display-l, about thirty words at most."        │  bone, medium
│ ◀  ▶     │                                                              │  no auto-rotate
│          │ Name, Role, Company                                          │
│          │ Also built for Orbit, Meridian Health, and Tarn Logistics.   │
├──────────┼──────────────────────────────┬────────────────────────────────┤
│ contact  │ Tell us what you're building.│ Name        [               ] │  DARK
│          │ We reply within one working  │ Email       [               ] │  form is the CTA
│ ● avail  │ day.                         │ Budget      [ band        ▾ ] │
│   for Q1 │                              │ Timeline    [ band        ▾ ] │
│          │ hello@caparisonlab.com       │ What you're [               ] │
│          │ +880 ...                     │ building    [               ] │
│          │ Dhaka                        │             [ Send enquiry ]  │
├──────────┴──────────────────────────────┴────────────────────────────────┤
│ Caparison.LAB (white)   tagline            work  capabilities  about     │  footer, same block
│ © 2026 Caparison Lab                                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

At 390 px: nav is wordmark + menu button (full-height bone sheet). Spine is
one line. Work rows are text-only (title and client, summary, mono budget and
duration line, tags), no thumbnails; images are saved for the case page.
Capability sheet stacks to one column, still shared hairlines. Process stacks
with the number and duration on one line. Form goes below the contact copy.

## Case study wireframe (1440)

```
├──────────┬───────────────────────────────────────────────────────────────┤
│ ← work   │ Nexus CRM                                        display-l    │
│          │ Internal sales tooling for a 40-person team      body-l, ash  │
│ client   │                                                               │
│ Acme Ltd │ [ cover image or video, full column width, radius-lg ]        │
│          │   (view-transition name shared with the index row)            │
│ budget   │                                                               │
│ $12k–18k │ the brief                                        marker       │
│          │ rich text at 720 px measure                                   │
│ duration │                                                               │
│ 9 weeks  │ what we built                                                 │
│          │ rich text with inline images breaking out to full column      │
│ year     │                                                               │
│ 2025     │ results                                                       │
│          │ ┌────────────┬────────────┬────────────┐                      │
│ team     │ │ 40%        │ 3.2s to 0.4s│ 0          │  same sheet language │
│ 3        │ │ faster     │ first load │ P1 bugs    │  as capabilities     │
│          │ └────────────┴────────────┴────────────┘                      │
│ stack    │                                                               │
│ react    │ gallery                                                       │
│ postgres │ ┌──────────────────────────────┐                              │
│ aws      │ │ item 1, full column          │  first full, then pairs      │
│          │ ├──────────────┬───────────────┤  at 2:1 and 1:2 alternating  │
│ live ↗   │ │ item 2       │ item 3        │  by order and aspect         │
│          │ └──────────────┴───────────────┘                              │
│          │ ┌──────────────────────────────────────────────┐              │
│          │ │ Want something like this?         paper panel │              │
│          │ │ [ Start a project ]  pre-fills the enquiry   │              │
│          │ └──────────────────────────────────────────────┘              │
└──────────┴───────────────────────────────────────────────────────────────┘
```

Text sits at a 720 px measure; media and the metrics sheet use the full
1000 px column. That step in width is what stops it reading as a blog post.
The CTA in ENQUIRY mode links to /contact?project=nexus-crm; the form shows a
"Regarding: Nexus CRM" line and sets sourceProjectId.

## Section rhythm (homepage)

| Section       | Surface   | Padding (top / bottom) | Shape |
|---------------|-----------|------------------------|-------|
| Hero          | bone      | 96 / 0                 | min-height 80svh, strip at foot |
| Work          | olive-950 | 64 / 96                | rows, hairlines |
| Capabilities  | bone      | 96 / 64                | one bordered sheet |
| Process       | paper     | 40 / 40                | four hairline columns |
| Testimonial   | bone      | 96 / 96                | one quote, manual nav |
| Contact       | olive-950 | 96 / 64                | copy left, form right |
| Footer        | olive-950 | 40 / 40                | continuous with contact |

Tall / tall / tall / short / tall / tall / short. No two adjacent sections
share the same structure.

## Placeholder copy (seeded as ContentBlocks)

home.hero.headline: "Scoped in a week. Priced up front. Shipped by week ten."
  (three lines, break after each sentence)
home.hero.sub: "Caparison Lab builds web and mobile apps for teams in
  Bangladesh and the Gulf. Every project on this site lists what it cost and
  how long it took."
home.hero.ctaPrimary: "Start a project"
home.hero.ctaSecondary: "See the work"
home.live.label: "currently building"
home.contact.heading: "Tell us what you're building."
home.contact.sub: "We reply within one working day."
home.contact.submitLabel: "Send enquiry"
home.contact.successMessage: "Sent. You'll hear from us within one working day."

Capability, weight 3:
title: "Web applications"
blurb: "Internal tools, customer portals, and dashboards. Next.js and
  Postgres by default. If your problem needs something else, we'll say so in
  the scoping week."
startingPrice: "from $8k"   typicalTimeline: "6–10 weeks"
deliverables:
  - A scoped backlog with a fixed price band before any build starts
  - A staging environment you can open from week one
  - Production deploy with monitoring and error alerts
  - A handover document and a recorded walkthrough
  - 30 days of fixes after launch, included

## Motion

- Load: the hero sequence above. Nothing else.
- Scroll: one reveal, on the first work row: the lime cursor draws down the
  row's left edge and the row fades in, 240 ms.
- Work rows hover/focus: background steps to olive-800, cursor draws down,
  thumbnail cross-fades in the spine. 120 ms.
- Index to case page: View Transitions API on the cover image, motion
  fallback where unsupported.
- Filters on /work, accordion in admin, tab changes: 240 ms ease-in-out.
- Reduced motion: no transform or opacity animation anywhere. Colour
  transitions only, per the token file's media query.

## Decisions the brief asked me to make

- /capabilities: one index page, not one page per capability. Four items
  with thin bodies would be padding. The page lists every capability with
  full deliverables and anchors by slug; a set body renders inline.
- Hex mark as SVG: I will trace the icon (hexagon, aperture, spark, 135°
  gradient with the three token stops) so it holds up at 640 px and in the
  OG image. If you have the vector, send it and I'll swap it in.
- Region: ap-southeast-1 (Singapore) for Supabase, sin1 for Vercel
  functions. Say so if you'd rather Mumbai.
- Schema additions needed by this plan: Project.currentlyBuilding (Bool)
  and Project.buildNote (String, e.g. "wk 4 of 7") to drive the live strip;
  ProcessStep.duration (String) for the timeline.

## Self-critique: what changed from my first draft, and why

1. Capabilities were a bento grid of unequal rounded cards with gaps. That
   is now the default layout of every SaaS landing page. Changed to a single
   bordered sheet with shared hairlines, zero gap, zero radius. Weight still
   controls span, so the admin preview still works, but it reads as an index,
   not as tiles.
2. The hero hex was a low-opacity watermark bleeding off the edge. Faded
   logos behind heroes are a template move. Changed to the mark at full
   strength in its own column, never under text, exactly as the brand guide
   encourages. Being clipped is the point; being faded was cowardice.
3. Process was "01 ── 02 ── 03 ── 04" with connector lines. That is the
   stock stepper. Numbers stay because it is a real sequence, but the
   connectors are gone and each step now carries a duration in mono. It
   becomes a timeline that restates the hero promise with data.
4. The hover thumbnail sat at the right end of each work row. Reserved
   empty slots look like a bug when idle, and a cursor-following preview is
   the awwwards cliché. Moved to the spine, which is supposed to show where
   you are. Risk: the eye travels left. If it feels wrong at 1440 I'll fall
   back to a fixed right slot and tell you.
5. The client roster was a logo row. Logo walls are wallpaper. It is now one
   sentence under the quote.
6. The brief's own wireframe has a trailing ⟶ on rows and "react · node" in
   the strip. Both break rules 20 and 21. Rows get no arrow; the cursor rule
   and the thumbnail are the affordance. Stack tags are separate tags with
   space, never a glyph between them.
7. Chanel's rule: availability appeared in the nav and in the spine. It is
   now only in the spine. The nav is the wordmark and four links.

Kept, and why it is not generic: the sticky left rail exists on docs sites,
but here it carries data and state, and it is the same object on every page
including admin. One dark work section is common, but two dark blocks total
on a bone page is not the lime-on-black studio everyone builds.

## Things I noticed in the assets

- The brand guide's table has the stacked lockups swapped. logo.png has
  white text (for dark surfaces); logo_Black.png has black text (for light).
- Files are under Assets/, not repo root and public/brand/. I'll copy the
  tokens to app/globals.css and the logos to public/brand/ with clean names
  (wordmark-ink.png, wordmark-bone.png, lockup-ink.png, lockup-bone.png,
  icon.png) in Phase 1.
- The location "Dhaka" and phone number in the contact block are
  assumptions; both are ContentBlocks / SiteSettings so you can change them.
