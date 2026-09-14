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
  at upload; videos need a poster frame and a 15MB soft cap.
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
  revalidateTag). Simple entities share EntityForm + SimpleCrud. Never nest a
  <form> inside the project editor form (the delete dialog is a <div>).
  Editor saving (owner's call, 2026-09-14): autosave runs for drafts only and
  never flips a draft to Published; a live page changes only via "Update live
  page"; moving a draft to Published shows an inline "Publish now" confirm.
  RichTextEditor round-trips Tiptap JSON through JSON.stringify before
  handing it to the form: ProseMirror attrs are null-prototype objects and a
  server action rejects them ("Cannot access toStringTag", found live
  2026-09-14 the first time a heading was added).
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
  case-page carousel, src/components/site/gallery-carousel.tsx: centred
  active slide, neighbours peek at 0.86 scale, title and subtitle above,
  dots below, infinite loop via three rendered copies with a silent jump
  back to the middle copy on settle, mouse drag, arrow keys on focus or
  hover, flex spacers centre the ends) and VIDEO
  (the videos section). Single slots replace on upload (claimSingleSlot
  deletes the old row and objects) and empty via clearSlot; deleteMedia
  refuses thumbnails and heroes. Admin: src/components/admin/project-media.tsx.
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
- The notch (owner's reference, 2026-09-13): src/components/site/nav-menu.tsx.
  At lg+ a 460px bone tab hangs from the page's top edge, straight sides
  (owner dropped the inverted corners) and a rounded bottom, holding the links. No action in the header (owner removed it);
  the hero carries the CTA. Wordmark 92x24, hex mark 24. "work" opens a panel of the featured projects
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
  mounts it at lg+ with WebGL and no reduced-motion preference, three seconds
  after load and only when idle; otherwise HeroStill shows the trimmed WebP still
  (public/brand/logo-3d-*.webp) in the top-right corner.
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
  conic-gradient ring. Styles live in globals.css under "Liquid metal button".

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
