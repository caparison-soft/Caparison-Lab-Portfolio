# Light redesign (owner, 2026-11-05)

Branch `redesign-light`. The owner asked for a full public-site redesign:
light mode, positioned for home service businesses (plumbing, HVAC, roofing,
cleaning, landscaping) in the US, UK, Canada and Australia, premium and very
interactive (scroll reveals, cursor follow, motion graphics, an AI assistant).
Built in one pass first, then fixed piece by piece with the owner.

## What changed from CLAUDE.md
- The public site is light: `.site-light` wraps main and footer in the (site)
  layout. `.site-ground` (matte black) is no longer used. Bone is the page,
  paper the raised surface, olive-950 the dark bands (`Section tone="dark"`
  or `.section-dark on-dark`). The admin is unchanged.
- The owner lifted the motion limits (one scroll reveal, no count-up). Every
  motion still has to respect prefers-reduced-motion.
- Liquid metal button, notch nav, preloader, hero glass and weave are retired
  on the public site. `ButtonStyleProvider` is "plain".
- Colour and type rules still hold: tokens only, lime never as text on a light
  surface, Satoshi and JetBrains Mono only, mono only for real data, sentence
  case, no emoji, no "→" in text, no middle dots between meta items, no
  violet, no gradient text, no soft grey card shadows.
- Every public string is still a ContentBlock. Redesign copy lives in
  `prisma/blocks/*.ts` (merged over the base list in prisma/seed.ts by key);
  re-seeding updates any value the owner never edited.
- `Project.kind`: CLIENT, INTERNAL (our product) or CONCEPT. Labels in
  `work.kind.*` blocks. Concepts always carry the concept note.
- Capabilities are now the four service groups (digital presence, business
  automation, content and branding, marketing and growth); `deliverables` is
  the list of services inside each group.

## Building blocks
- `src/styles/site.css`: buttons (`.cl-btn`, `--ink`, `--ghost`, `--sm`),
  `.cl-kicker` (sentence-case label with a lime hex), `.cl-pill`, `.cl-card`
  (+ `.cl-card-hover`), `.cl-spot` (pointer light inside a card, driven by the
  cursor), `.cl-chip` (`--lime`, `--ink`), `.cl-link` (drawn underline),
  `.cl-rule`, `.cl-faq-*` (animated disclosure).
- Area stylesheets, already imported by globals.css: `src/styles/home.css`,
  `services.css`, `work.css`, `chat.css`. Put new CSS for your area there,
  inside `@layer components`, using token variables only.
- Reveal on scroll without client JS: add `data-reveal="up" | "fade" |
  "scale" | "clip" | "line" | "stagger"` to any element (optional delay:
  `style={vars({ "--d": 120 })}` in ms, `vars` from motion/split.tsx).
  `<Split text="..." as="h2" />` splits a heading into masked words that rise.
  RevealObserver (in the layout) does the rest. "stagger" staggers direct
  children. Keep reveals on content, not on every wrapper.
- `src/components/motion/`: `Magnetic`, `CountUp`, `VelocityMarquee`,
  `Cursor` (mark an element `data-cursor="view"` and optionally
  `data-cursor-label` to turn the cursor into a lime disc with a label),
  `SmoothScroll` (Lenis; anything that scrolls on its own needs
  `data-lenis-prevent`).
- `src/components/site/cta-button.tsx`: `<CtaButton href variant size arrow>`.
- `Section` from `@/components/ui` still gives the gutter and 1240px
  container: `tone="bone" | "paper" | "dark"`, `pad`. Spacing utilities are
  the token scale only (p-1 = 8px ... p-7 = 160px); anything else is an
  arbitrary value like `mt-[12px]`.
- Type: `text-mega` (home headline), `text-display-xl`, `text-display-l`,
  `text-h2`, `text-h3`, `text-h4`, `text-body-l`, `text-body`, `text-small`,
  `data` / `font-mono` for figures.

## What was built (first pass, 2026-11-05)
- Shell: `site-header.tsx` (floating bar, hides on scroll down, full-screen
  sheet under lg), `site-footer.tsx` (olive-950, local clock, the name set
  huge), `intro.tsx` (first visit to / per session), `ScrollProgress`,
  `Cursor`, `SmoothScroll` (Lenis), `RevealObserver`, all mounted in the
  (site) layout. The inline BOOT script sets `html[data-js]` and
  `html[data-intro]` before paint and clears both after 5s if hydration
  never arrives.
- RevealObserver waits until React has hydrated an element (its fiber key is
  present) before touching it; setting `data-in` earlier caused hydration
  warnings. Clip reveals are observed through their parent, because Chrome
  never reports a fully clipped target as intersecting.
- Motion components always pass their motion values in `style` and flatten
  the range under reduced motion. Branching on `useReducedMotion()` in render
  gives the server and client different markup.
- Home (`src/app/(site)/page.tsx`, components in `src/components/site/home/`):
  the hero with the lead flow motion graphic and pointer-reactive dot field,
  a tilted velocity marquee, problems read one at a time, the services rail
  (pinned horizontal scroll at lg+), the trades picker, the work grid with
  parallax, the process line, promises with count-ups, FAQ with the assistant
  button, and a closing lime band.
- `/services` and `/industries/home-services`
  (`src/components/site/services/`): a missed-call calculator, a pinned
  seven-step system flow and three packages. `/capabilities` is a 308 to
  `/services` (a route handler, so `#slug` survives).
- `/work`, the case page, `/about`, `/contact` and the 404 are on the light
  palette. The case page has a kind banner; concept metrics read as targets.
  `/contact?type=review` preselects the free review.
- The assistant: `src/app/api/chat/route.ts`, `src/lib/chat/*`,
  `src/components/site/chat/*`. `ANTHROPIC_API_KEY` is optional: without it
  the route answers 503 and the widget says so. It is rate-limited from
  AuditLog (30 per hour per IP, 1,000 per day overall), and its
  `create_enquiry` tool writes an Inquiry under the enquiry limits.
- Dimming for scroll focus steps down to ash, never to faded ink: faded text
  failed axe contrast.
- Invented sample projects, testimonials and stats are drafts in the seed.
  Published work is OfficeDay, AssetBender (INTERNAL) and Lone Star Plumbing
  (CONCEPT).

## Owner to confirm
- Prices: the capability prices and the three home services packages.
- The availability note in Settings, and the hero status pill.
- The OfficeDay and AssetBender text, covers and screenshots.
- `CHAT_MODEL`: the default is claude-opus-5-5. Haiku 5.5 or Sonnet 5.5
  cost less.

## Rebrand (owner, 2026-11-05, same day)
- Bright Leaf #CDFF9B and Emerald #203D43 replace lime and olive-950, under
  the same token names. Light-surface buttons are Emerald with a Leaf label;
  inside `.section-dark` / `.on-dark` the button flips to Leaf (`.cl-btn`
  reads `--btn-*` and `--puck-*` variables). Brand fills that were ink
  (chips, icons, progress lines, the burger, the cursor dot) are Emerald.
- Archivo Black is `--font-display`. `.site-light main h1` and `.cl-display`
  use it with `font-synthesis: none` (one weight). The home headline, the
  footer name and the marquee are in capitals; longer lines stay sentence
  case.

## Home on black (owner, 2026-11-07)
After a run of prototypes (scratchpad, not in the repo) the owner picked a
black home page built round a service orbit. Only the home page is black; the
other pages stay light until the owner says otherwise.
- `main.home-black` (src/styles/home-black.css): ink ground, bone text, sage
  secondary text, Bright Leaf the one accent. Headings are Satoshi medium,
  not Archivo caps: `.site-light main.home-black :is(h1, h2, h3)` undoes the
  display rule. This breaks the brand line "the brand dark is olive-950,
  never black" on purpose, for this page; the owner chose black over Emerald
  after seeing both.
- Hero (src/components/site/home/orbit/): the headline with Leaf words
  (asterisks in the copy) and an open padlock in place of the o of "unlock"
  (`{lock}` in the copy; it leans right and opens to the right so it never
  touches the l). Six services circle it on an oval sized from the headline,
  one lap in 80s, slower under the pointer, stopped while a card is open. A
  card opens on hover, keyboard focus or tap and takes the first spot that
  fits on screen without covering its icon. Under 860px the orbit is a circle
  under the headline with tap-to-open sheets. The canvas behind it
  (hero-sky.tsx) draws twinkling stars, ripples from the headline and a comet
  that flashes each service it passes. Pointer position is tracked on the
  window by coordinates, so floating things over the hero (the assistant
  button) do not count as leaving it.
- Copy keys: home.hero.*, home.orbit.<id>.{name,pitch,items,price,visual}
  for websites, automation, crm, pipeline, production, ads; home.mission.*;
  home.statement.*. Card pictures carry an "Example" tag: their numbers are
  made up. No stock photos anywhere on the page.
- Mission row, then the pinned statement: words light up as you scroll (dim
  words stay 3:1 or better, large text), then an example phone rises and the
  button appears. The phone scales to the window height so the button never
  touches it. Reduced motion and no-JS: nothing pins, all lit.
- Buttons: the arrow fill button (src/components/ui/arrow-fill-button.tsx,
  CSS in site.css) is only for "Free website review" and "Explore our
  services". "See the work" is plain text with a drawn underline; the header
  pill says "Let's talk".
- Header: Home, Services, Work, About as tabs (a plate follows the pointer, a
  line sits under the current page); dark tone on the home page only.
- Assistant launcher: Bright Leaf button with the brand spark; its label says
  hello once, a few seconds after load.
