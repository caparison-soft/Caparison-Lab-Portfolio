# Caparison Lab

Build studio portfolio + CMS. Next.js 15 App Router, TS strict, Tailwind v4,
Prisma 7 + Supabase Postgres (free tier), Supabase Auth, Cloudflare R2 for media,
Tiptap, motion, Resend. Hosted on Vercel.

Design plan: docs/PHASE0_DESIGN_PLAN.md. Brief: CLAUDE_CODE_PROMPT.md.
Brand: CAPARISON_LAB_BRAND_GUIDE.md. Tokens: caparison-tokens.css (wired into
src/app/globals.css). Setup checklist: docs/SETUP.md.

## Non-negotiable
- Colours, type, radius, and motion values come ONLY from caparison-tokens.css.
  globals.css disables Tailwind's default colours, text sizes, radii and the
  spacing multiplier, so only token utilities exist (p-1 = 8px … p-7 = 160px).
- lime (#D6F631) is NEVER text on a light surface (1.05:1). It is a fill with
  ink on top, or a small non-informational graphic.
- The brand dark is olive-950 (#171B06), never #111 or #0B0B0B.
- Two typefaces: Satoshi, JetBrains Mono (self-hosted, /public/fonts). Mono
  only for genuine data (.data class or font-mono).
- No public-site copy is hardcoded. Every string is a ContentBlock row.
- Server components by default. Mutations via server actions.
- RLS enabled with deny-all default on EVERY table. Supabase exposes PostgREST
  on the public schema, so a table without RLS is publicly writable. New table
  = new migration that enables RLS. Run `npm run verify:rls`.
- R2 and Resend variables are optional (staged go-live, 2026-09-13): without R2
  the build and site run, uploads and the reconcile cron answer "not
  configured"; without Resend an enquiry is stored and logged as
  email.unconfigured. Everything else in .env.example is required at build.
- SUPABASE_SERVICE_ROLE_KEY is server-only. Never NEXT_PUBLIC_, never imported
  into a client component. `npm run verify:bundle` after a build.
- Prisma 7: URLs live in prisma.config.ts (DIRECT_URL for the CLI) and
  src/lib/db.ts (DATABASE_URL through the pooler, adapter-pg with max: 1).
  Generated client is src/generated/prisma (gitignored, built on postinstall).
  New migrations: `npm run db:migrate:new > prisma/migrations/<ts>_<name>/migration.sql`
  then `npm run db:migrate`. No shadow database is used.
- Media lives in Cloudflare R2 behind cdn.caparisonlab.com. Uploads go browser
  -> presigned PUT, never proxied through a Vercel function (4.5MB body limit).
  Store keyPrefix, derive URLs from NEXT_PUBLIC_CDN_URL at read time.
- R2 has no image transforms and no video transcoding. sharp makes the variants
  at upload; videos need a poster frame, 15MB soft cap, 60MB hard cap. Videos
  over 15MB are compressed in the admin's browser before upload
  (src/lib/client/compress-video.ts): first with WebCodecs through mediabunny
  (the browser's own, usually hardware, H.264 encoder: Chrome, Edge, Safari;
  a 174MB 1080p/60s clip took 13s including upload), falling back to
  ffmpeg.wasm (single-thread core copied to public/ffmpeg on postinstall,
  gitignored; minutes per clip) where WebCodecs H.264 is missing (Firefox).
  Both: H.264 MP4, max 1920x1080, bitrate sized to land under 60MB with a
  6 Mbps ceiling, AAC audio, faststart; originals up to 500MB. Owner's call,
  2026-09-14, over a server-side transcoder (no cost). Confirm reads only the first 16MB of a video (getObjectHead) to
  sniff, probe and grab frame 0, and falls back to the whole file when the
  moov atom is at the end; the admin pages that host the upload actions set
  maxDuration 300.
- Never run R2 images through Vercel's image optimiser. srcset from the stored
  variants, or next/image with unoptimized (set globally in next.config.ts).
- Supabase free tier pauses after 7 days idle. The /api/cron/keepalive job is
  load-bearing - do not remove it.
- One scroll-triggered reveal on the entire site. One hero load sequence.
  prefers-reduced-motion always respected.
- Read the "Hard rules" section of CLAUDE_CODE_PROMPT.md before any UI work.
- Build phases are gated. Stop at the end of each phase and wait for approval.

## Local dev
- Node 22 (.nvmrc). The AWS SDK and supabase-js warn on Node 20; Vercel builds on 22.
- Postgres 17 via Homebrew (`brew services start postgresql@17`), database
  caparison_dev with a stub auth.users table and anon/authenticated roles.
- `.env` holds local values (gitignored). `.env.example` is the contract.
- `npm run dev`, `/styleguide` for the token sheet.
- Auth locally: `npm run dev:auth` runs scripts/dev-auth.mjs, a stand-in for the
  Supabase Auth API on :54321 (.env points NEXT_PUBLIC_SUPABASE_URL there).
  Sign in at /login as arif@caparisonsoft.com / caparison-dev. The matching
  auth.users row exists in caparison_dev so the Profile trigger created the
  ADMIN profile. Never point production at this.
- Authorisation: middleware checks the session; src/lib/auth.ts requireAdmin()
  (layouts) and assertAdmin() (every server action) check Profile.role with
  Prisma. Middleware runs on the edge and cannot use Prisma.
- Login is rate-limited from AuditLog (5 failures per 15 minutes per email or IP).
- Admin CRUD: src/lib/admin/schemas.ts (Zod, shared), project-actions.ts and
  entity-actions.ts (server actions: assertAdmin, validate, mutate, logAudit,
  revalidateTag). Every save also calls revalidatePath("/", "layout"): the
  public pages are statically rendered on a one-hour window and a tag alone
  does not drop that HTML, so before 2026-09-15 an admin edit could take an
  hour to appear. The site is a handful of routes, so sweeping the whole tree
  is cheap. Content written straight to the database (a seed, a script) still
  needs a save in the admin, or a redeploy, to show. Simple entities share EntityForm + SimpleCrud. Never nest a
  <form> inside the project editor form (the delete dialog is a <div>).
  Editor saving (owner's call, 2026-09-14): autosave runs for drafts only and
  never flips a draft to Published; a live page changes only via "Update live
  page"; moving a draft to Published shows an inline "Publish now" confirm.
  RichTextEditor round-trips Tiptap JSON through JSON.stringify before
  handing it to the form: ProseMirror attrs are null-prototype objects and a
  server action rejects them ("Cannot access toStringTag", found live
  2026-09-14 the first time a heading was added).
- Project types (Category) are editable at /admin/types (owner, 2026-09-14):
  EntityPage with entity "category", noStatus (no draft state), slug
  uniqueness, delete refused while any project uses the type; the project
  editor's Type field links there.
- @tanstack/react-table is pinned to v8; v9 has a different API.
- Draft preview: /preview/[slug]?token=HMAC(slug) from src/lib/preview.ts.
- Media locally: `npm run dev:s3` runs scripts/dev-s3.mjs, an S3 stand-in on
  :9000 storing under .dev-s3/. .env sets R2_ENDPOINT and NEXT_PUBLIC_CDN_URL
  to it. Production leaves R2_ENDPOINT unset. Upload flow: requestUpload
  (presign) -> browser PUT -> confirmUpload (sniff, caps, sharp variants,
  ffmpeg poster via ffmpeg-static, Media row). Media slots (owner's
  structure, 2026-09-14): Media.slot is THUMBNAIL (one image per project,
  Project.coverImageId: home hover card, index, OG; 16:9 recommended, the
  confirm step warns otherwise), HERO (one image or video,
  Project.heroMediaId: top of the case page; a YouTube/Vimeo videoUrl takes
  precedence), GALLERY (images with title + caption-as-subtitle, the
  case-page coverflow carousel, src/components/site/gallery-carousel.tsx:
  Swiper (MIT) with the owner's Skiper 47 settings (effect coverflow, rotate
  0, depth 100, modifier 2.5, scale 0.9, 1.65 slides per view and gap 40 on
  md+, 1.25 and gap 20 below, centred, loop, grab cursor, keyboard; the scale
  and the narrow view are the owner's 2026-09-15 call for a plainly bigger
  active slide, 736px against 444px at 1440, with the neighbours cut by the
  container on purpose), our pagination dots, arrow buttons
  with a counter, own dots (role=tab) and title and subtitle above
  crossfading. Short galleries are repeated to at least eight slides because
  Swiper disables loop when fewer than ~2.5 fit plus spares; counter, dots
  and title map realIndex % n. Owner rejected the hand-rolled zoom slider
  2026-09-14) and VIDEO
  (the videos section). Single slots replace on upload (claimSingleSlot
  deletes the old row and objects) and empty via clearSlot; deleteMedia
  refuses thumbnails and heroes. Admin: src/components/admin/project-media.tsx.
  Every drop zone states the slot's recommended size (RECOMMENDED in
  media-uploader.tsx, owner 2026-09-15): thumbnail and hero 16:9 1920x1080,
  gallery 16:10 1600x1000, videos 16:9 1920x1080, saying whether the shape is
  cropped (thumbnail, gallery) or kept (hero, videos). The widest variant is
  1920 (IMAGE_WIDTHS), so nothing above that helps. The capability image field
  uses the GALLERY slot and inherits its 16:10 line.
  (Upload details continued: on Vercel the ffmpeg binary
  only reaches the function through outputFileTracingIncludes for /admin/**
  in next.config.ts, found live 2026-09-13). deleteMedia removes every
  object under the prefix and fails loudly. /api/cron/reconcile reports
  orphans weekly into AuditLog; the library shows the latest report.
- Backups: /api/cron/backup (weekly, vercel.json) dumps every public table
  as gzipped JSON, AES-256-GCM encrypted under BACKUP_KEY (the bucket is
  public), to R2 backups/, keeps eight; restore with
  scripts/restore-backup.ts. Runs on Vercel so no secret lives in GitHub
  (owner's call, 2026-09-13).
- Enquiries: submitInquiry rate-limits from AuditLog (5/hour per IP, 3/day per
  email) and notifies via Resend (src/lib/email.ts). EMAIL_DRY_RUN=true in .env
  records the email in AuditLog instead of sending. Inbox at /admin/inquiries;
  CSV at /admin/inquiries/export; Resend webhook at /api/webhooks/resend.

## Navigation
- No left rail (owner's call, 2026-09-14): Spine renders the rail (marker,
  index, filters) as a row above full-width content inside the 1240px
  container; the 180px column is gone everywhere, /work filters wrap
  horizontally.
- The whole public site sits on matte black (owner's call, 2026-09-14):
  .site-ground wraps main + footer in the (site) layout and root not-found and
  remaps the colour tokens (bone/paper to two matte greys, ink/ash to
  bone/sage, cobalt to lime, hairlines to white/10); .section-dark, .on-dark and
  olive/lime/ink fills get the originals back inside them. One fixed grain
  layer covers the viewport. The admin keeps the light palette. The hero
  keeps pure ink under its shader lift.
- No bar (owner's call, 2026-09-13): the header is fixed and transparent, laid
  over the page (sections start with at least 64px of padding; html has
  scroll-padding-top for anchors). NavScroll sets html[data-nav-compact] past 64px of scroll (header 64px
  to 48px, wordmark to hex mark) and html[data-nav-ground] (dark or light,
  from the section under the header's left edge) so the wordmark and the sheet
  toggle invert over light sections. The hero has no spine rail; other
  sections keep theirs.
- Favicon: src/app/favicon.ico is generated from public/brand/icon.png at
  16/32/48 (Next serves it first, ahead of the metadata icon, so the Next
  starter default that shipped there showed the Vercel mark in the tab until
  2026-09-15). The mark's aperture is transparent in that PNG, so it reads on a
  light or a dark tab bar. Regenerate it if the brand icon changes.
- The compact nav mark is HexMark variant="simple": one currentColor hexagon
  with the aperture knocked through, bone on dark ground and ink on light, set
  by .nav-icon in globals.css. The full gradient mark put a white plate on the
  matte ground and its lower-right went to olive on black, which the brand
  guide already rules out (full colour on bone, paper or olive-950 only; below
  its 24px floor use a simplified single-colour hex). Owner, 2026-09-15.
- The notch (owner's reference, 2026-09-13): src/components/site/nav-menu.tsx.
  At lg+ a 460px bone tab hangs from the page's top edge, straight sides
  (owner dropped the inverted corners) and a rounded bottom, holding the links. No action in the header (owner removed it);
  the hero carries the CTA. Wordmark 92x24, hex mark 24. The liquid metal
  button is listed with the dark-surface exceptions in .site-ground so its
  olive-950/ink body and sage label look the same on every page (owner
  found the case-page CTA washed out, 2026-09-14). "work" opens a panel of the featured projects
  (getFeaturedProjects(4), budget and duration as data) and "capabilities" the
  first four capabilities; both end in an all-link (nav.workAll,
  nav.capabilitiesAll). Escape, outside click and route change close it. Under
  lg NavSheet is a bone sheet with the same panels as accordions. Panel cards
  are paper on bone everywhere.
  Nav is async (it fetches both lists); reduced motion sets every transition to 0.

## Hero layout
- Owner's call (2026-09-13): the hero is min-h-[100svh] with the content
  centred vertically (the next section must not show on load); the "currently
  building" strip is gone (home.live.* keys and getLiveProject stay for admin
  use). One CTA. Sub sits mt-3 under the headline.
- Headline is text-display-hero at lg+ (clamp 44-72px, weight 900, defined in
  globals.css @theme) so the two long sentences stay one line each beside the
  glass logo; phones keep display-xl.

## Case study page (owner's brief, 2026-09-14)
- Results render as a bento (owner-supplied stats-bento, 2026-09-14,
  rebuilt): src/components/site/results-bento.tsx. The first metric is the
  lead, a lime card two rows tall with a hatched corner and the label as a
  pill; the rest are paper cards laid out by rule from the count (1: lead
  alone; 2: lead + tall card; 3: lead + two stacked; 4: lead + wide + two
  small; 5+: lead + wide + a row). Period and source show under each value.
- The story panel (owner-supplied spatial showcase, 2026-09-16, rebuilt):
  src/components/site/case-story.tsx. A picture on one side, the brief on the
  other, and "What we built" as plain lime text (no shape, owner 2026-09-16)
  that opens a native <dialog>: the top layer clears the grain and the header,
  Escape and focus trapping come free, the body scrolls inside a
  max-h-[82svh] box and the page behind is locked while it is open. The window
  is glass (bone mixed into a translucent black, blur 24px) and rises 28px as
  it fades in, through @starting-style with allow-discrete on display and
  overlay; reduced motion drops the rise. Lime as text is only allowed here
  because the panel sits on the matte ground, and the trigger stays lime on
  hover with only the underline moving: bone is remapped to the matte grey
  inside .site-ground, so a hover colour change made it disappear. The two
  fields are Project.brief and Project.whatWeBuilt (rich text, Story tab), the
  picture is the STORY media slot (Project.storyImageId) and the side is
  Project.storySide, set in the admin rather than toggled by the visitor. With
  no picture uploaded the brand's 3D mark stands in, so the panel always has
  its two columns. The picture floats over a bloom of plain bone light and
  nothing else: a lime bloom, a hover tilt and a dashed ring around it were
  each tried on 2026-09-16 and dropped. Reduced motion stops the float. Headings come from case.briefHeading
  and case.builtHeading. Project.body is retired: every project was split
  into the new fields on 2026-09-16, so the editor's Body tab, the schema entry
  and the case-page fallback are all gone. The column keeps the original text
  as a safety net and can be dropped later. ScrollRevealText is unused as a
  result; it still works if the effect is wanted somewhere.
- Unused since 2026-09-16, kept in case the effect is wanted again: the
  scroll-in body (owner-supplied "text gradient scroll",
  2026-09-14, rebuilt): src/components/site/scroll-reveal-text.tsx splits
  text nodes in paragraphs, headings and list items into word spans after
  hydration and each word brightens over its own slice of the block's view
  timeline (CSS animation-timeline: view(), no JS per frame). Browsers
  without scroll-driven animations and reduced motion show the text as is.
  Body column is centred (max 720px, lg:mx-auto).
- Uploaded videos (hero and the videos section) play in
  src/components/site/video-player.tsx (owner-supplied design, rebuilt:
  floating blurred control pill on hover/focus/touch with seek, volume,
  play, mute, speed, fullscreen; keyboard space/k/arrows/m/f; inline SVG;
  motion; native controls until hydration). YouTube/Vimeo stay iframes.
  The hero frame is capped at 880px on lg+.
- Header (owner's brief, 2026-09-15): src/components/site/case-header.tsx,
  two columns at lg. Left: category pill, title whose letters rise in per
  word (motion stagger), summary, outcome, role and platform pills, live-site
  outlined button with an outward arrow. Right: a raised facts card (client
  logo + name, budget, duration, launched, status with a lime dot when live,
  team) that slides in and whose numbers count up on first view (motion
  animate; dates tick by month; display overrides skip the count). The card
  tilts toward the pointer (up to 8 degrees, springs back) with a sheen that
  follows and the content 24px forward in depth; mouse only. Reduced motion
  renders in place with no tilt. Any per-letter mask needs pb-[0.22em]
  -mb-[0.22em] on the overflow-hidden span: display sizes are line-height 1, so
  the clip box stops at the baseline and shaves the tail off every g, y and p
  (owner, 2026-09-16). Where the mask also hides a waiting copy, as in the
  capability slider, push that copy past the taller box (140%, not 110%). The stack marquee and hero follow below.
  Section order down the page: header, stack, hero, body, gallery, key
  decisions, how it went, results, testimonial, videos, team, CTA. The gallery
  sits with the body because it is part of the story, not an appendix under
  the results (owner, 2026-09-15).
  Lime on the header (owner, 2026-09-15: page felt colourless): the category
  pill is a lime fill with ink text, the live-site link is lime outline and
  label (lime fill + ink on hover, via .case-live restoring --color-ink), the
  live status value is lime next to its dot, and a lime hairline runs along
  the card's top edge. Lime stays a fill or dark-ground text only.
- Project story fields: outcome (bold line under the summary), role ("our
  part"), platforms[], stage (LIVE/BETA/RETIRED), launchedAt (replaces year in
  the sidebar when set), afterNote ("since launch", under the results);
  ProjectDecision (title + reason, "key decisions") and ProjectPhase (label +
  when + note, "how it went") child tables; Project.team implicit m2m to
  TeamMember ("who worked on it", published members only); ProjectMetric.period
  and .source ("first 90 days, measured by Mixpanel"). Published testimonials
  linked to the project render as one pull quote under the results. Admin:
  Details tab (role, stage, launch date, platforms, team picker) and a Story
  tab (outcome, decisions, timeline, since launch); metrics rows carry period
  and source. Migration 20260914180000_case_story was written by hand
  (migrate diff cannot introspect this database because of the auth.users
  reference) and enables RLS on the three new tables with published-project
  read policies. Copy keys case.decisionsHeading, timelineHeading,
  teamHeading, afterLabel, meta.role/platform/stage/launched, stage.*,
  metricMeasured.

## Stack marks
- On the case page the stack is its own strip under the facts (owner,
  2026-09-14): src/components/site/infinite-slider.tsx (ibelick
  infinite-slider rebuilt on motion + ResizeObserver, children rendered
  twice, slows on hover, static under reduced motion) scrolling StackMark
  tiles (64px, name slides in inside the tile on hover since anything outside
  is clipped by the slider) in a 520px strip with faded edges, five tiles
  across; short stacks repeat to fill the loop. /work rows keep the small StackLogos row.
- Stack tags on the case page and the /work rows render as brand marks
  (simple-icons, CC0, monochrome in the text colour) with the name in a
  tooltip on hover or focus and as aria-label; names without a mark (AWS,
  Adobe are not in simple-icons) fall back to a text tag. Map of tag name to
  icon key lives in src/components/site/stack-logos.tsx; add new stacks there.

## Work section (home)
- Owner-supplied interactive hover links (2026-09-14, replacing the earlier
  showcase), rebuilt as src/components/site/home/project-showcase.tsx: each
  row is a Next link with a display-size title whose letters fan out on hover
  (motion variants with stagger), the thumbnail springs in and follows the
  pointer (useSpring on motion values, hover devices only, none without a
  cover), an inline-SVG arrow slides in from the right; keyboard focus shows
  the same state; reduced motion drops stagger and spring. First row keeps
  the site's one scroll reveal. The section sits on .ground-matte: the hero's tone
  (color-mix bone 5% into ink) and grain, no threads. The old rail thumbnails
  and their :has() CSS are gone; ProjectRows still serves /work.

## Capabilities section (home)
- Owner-supplied hover slider (2026-09-14), rebuilt as
  src/components/site/home/capability-slider.tsx: titles on the left (letters
  fan up per word on hover or focus; reduced motion just recolours), the
  active capability's image on the right with a top-down clip reveal, blurb
  and price/timeline under it, each title a link to /capabilities#slug.
  Images: Capability.imageId -> Media (relation "CapabilityImage"), set from
  the admin capability form's "Home page image" field (EntityForm type
  "image": hidden id + `<name>Preview` URL + library MediaUploader). The old
  weighted sheet and its admin preview are gone; `weight` stays in the schema
  unused.

## Process section (home and about)
- Owner-supplied "how it works" cards (2026-09-14), rebuilt as
  src/components/site/home/process-cards.tsx: pinned, tilted cards in a
  zig-zag (positions for up to five steps in a 1000-wide frame) joined by a
  dashed path whose dashes crawl (motion; still under reduced motion), ruled
  lines behind, lime pin and mono number; stacked in order under md. Data is
  the ProcessStep rows; no colour themes, tokens only.

## Hero ground (weave + grain)
- src/lib/hero-weave.ts: our own WebGL2 fragment shader (fbm domain-warped
  thread field, gaussian pointer well, per-thread brightness, one lime thread,
  vignette and floor/ceiling fades). HeroWeave owns the canvas and clock;
  HeroGlass drawImage()s that canvas into the glass backdrop every frame so
  threads refract through the logo with no seam. Grain is .hero::after.
  Reduced motion renders one still frame; no WebGL2 leaves plain ink.
- Matte look (owner call, 2026-09-13): threads at bone weight 0.38, lime 0.8,
  plus a flat unmasked uLift of 5% bone over the whole ground so the ink reads
  as charcoal, with .hero::after grain at 0.15. The lift lives in the shader
  so the glass refracts the same tone; keep the section colour itself ink.
- Technique studied from a public site; the code is ours, not copied.

## 3D logo (hero)
- public/caparison_logo.glb + src/lib/vendor/caparison-logo.js (from
  Assets/caparison-logo-3d.zip, vanilla build). src/components/site/hero-glass.tsx
  mounts it at lg+ with WebGL and no reduced-motion preference, right after
  the load event. The trimmed WebP still (public/brand/logo-3d-*.webp) is
  server-rendered inside the glass host at the glass's exact geometry
  (w 75.8cqh, right 248px) and cross-fades out when the glass fires
  logo:ready; it simply stays when WebGL is off. Phones get HeroStill in the
  top-right corner. The mounted glass outlives the page (owner, 2026-09-15:
  the still showed for a moment on every return to /): the canvas is
  appended by the effect, not rendered by React; leaving pauses the frame
  loop (vendored pause/resume) and keeps canvas + handle in module state;
  coming back with the same host/block geometry reattaches it in a layout
  effect with ready state from the start, so nothing but the glass paints.
  The backdrop painter goes through a slot so each mount's DOM is what gets
  drawn, and the lines are re-measured when the rise reveal ends.
- Load screen (owner's call, 2026-09-15: no visible still-to-glass swap):
  src/components/site/preloader.tsx in the (site) layout covers a full page
  load with the matte ground, the hex mark and a hairline bar until the glass
  reports ready through src/lib/glass-state.ts (or "off": phones, reduced
  motion, no WebGL, pages without a glass host), capped at 6s. An inline
  script in the layout sets html[data-preload] before the first paint, which
  holds .reveal/.reveal-quick/.reveal-mark paused so the hero reveal plays
  when the screen lifts, and clears everything after 8s should hydration
  never arrive; the root <html> carries suppressHydrationWarning for that
  attribute. Client-side navigation never shows it (the layout persists).
- Real refraction over the headline: three.js can only refract what it draws, so
  hero-glass.tsx paints the headline lines and the sub (elements marked
  data-glass-text) into the backdrop plane at their exact DOM positions, and the
  DOM copies turn transparent via .hero-block[data-glass-ready]. Fonts must be
  loaded first (document.fonts.ready). Resize repaints the backdrop.
- Clear glass on the dark hero (owner, 2026-09-13: more transparent, less white
  on the faces, brighter edges, no shadow): thickness 0.12, ior 1.5, dispersion 6,
  roughness 0, clearcoatRoughness 0, transmission 1,
  envMapIntensity 3.2, envPreset "strips" (thin bands give rim glints instead
  of white faces; "wide" remains available), envBase "#1f1f1f" (the measured
  ground tone, so reflections between the strips are the page, not black),
  toneMapping "none" with exposure 1 (ACES crushed the dark ground seen
  through the glass into a shadow), clearcoat 0.6, depthScale 0.65, fit 1.9, swing
  ±0.55 rad instead of a full spin, backdrop takes the section background,
  text plane at z -0.8. The canvas host runs 240px past the block's right edge
  and the x offset is computed from the block width, so the near side never
  clips while swinging. Light rig untouched. Vendored additions: backdrop.size,
  repaintBackdrop(), envBase, toneMapping, darkCore (unused). Change the look only with the owner.

## Buttons
- Public site (owner's call, 2026-09-13): every filled button is the liquid metal
  button, src/components/ui/liquid-metal-button.tsx, a chrome ring from
  @paper-design/shaders' liquid-metal shader around an olive-950 to ink body.
  Button reads ButtonStyleProvider ("metal" in the (site) layout and the root
  not-found; admin and styleguide stay "plain"). Ghost stays a text link.
- Adapted from the pasted component: fluid width, md 46px / sm 40px, Link or
  <button type="submit">, pending/disabled, sage label (bone on hover) instead of
  #666 for contrast, visible focus ring. Shader mounts only near the viewport and
  is destroyed when the button leaves (WebGL context budget shared with the hero
  weave and glass). Reduced motion: speed 0 and no ripple. No WebGL2: a static
  conic-gradient ring. u_shape 1 is a circle and the shader leaves everything
  outside it transparent, so u_scale has to be large enough to put the whole
  pill inside the shape: at the pasted value of 8 the chrome stopped about 60%
  across a wide button and the right end of the outline was bare (owner,
  2026-09-15). u_scale 40 with u_repetition 8 covers every width the site uses;
  raise the two together, since scale also stretches the stripes.
  Styles live in globals.css under "Liquid metal button".

## Audits
- Never run `next dev` and `next start` at the same time: both use .next and
  dev overwrites the production build (404s and header errors follow).
- Lighthouse: stop dev, `npm run build && npx next start -p 3001`, then
  `CHROME_PATH=<playwright chromium> npx lighthouse http://localhost:3001/ --preset=desktop`.
  The full-page screenshot phase can report a phantom CLS; confirm with
  `--disable-full-page-screenshot` or a PerformanceObserver.
- axe: @axe-core/playwright with wcag2a/aa, wcag21a/aa, best-practice tags,
  excluding the nextjs-portal element. Public and admin must be at zero.

## Voice
Plain, specific, understated. Numbers over adjectives. Sentence case.
Buttons say what happens. No emoji. No "elevate", "seamless", "cutting-edge".
No middle dots between meta items. No "→" on links.
