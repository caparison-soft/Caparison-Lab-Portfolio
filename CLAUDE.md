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
- @tanstack/react-table is pinned to v8; v9 has a different API.
- Draft preview: /preview/[slug]?token=HMAC(slug) from src/lib/preview.ts.
- Media locally: `npm run dev:s3` runs scripts/dev-s3.mjs, an S3 stand-in on
  :9000 storing under .dev-s3/. .env sets R2_ENDPOINT and NEXT_PUBLIC_CDN_URL
  to it. Production leaves R2_ENDPOINT unset. Upload flow: requestUpload
  (presign) -> browser PUT -> confirmUpload (sniff, caps, sharp variants,
  ffmpeg poster via ffmpeg-static, Media row). deleteMedia removes every
  object under the prefix and fails loudly. /api/cron/reconcile reports
  orphans weekly into AuditLog; the library shows the latest report.
- Backups: .github/workflows/backup.yml (weekly pg_dump to R2, keeps eight).
- Enquiries: submitInquiry rate-limits from AuditLog (5/hour per IP, 3/day per
  email) and notifies via Resend (src/lib/email.ts). EMAIL_DRY_RUN=true in .env
  records the email in AuditLog instead of sending. Inbox at /admin/inquiries;
  CSV at /admin/inquiries/export; Resend webhook at /api/webhooks/resend.

## Navigation
- The bar and the hero sit on ink (#000000) via .ground-ink, at the owner's request;
  the rest of the dark sections stay olive-950.
- Full-width olive-950 bar, sticky. NavScroll sets html[data-nav-compact] past
  64px of scroll; CSS shrinks the bar to 48px and swaps the wordmark for the hex
  mark. The hero has no spine rail; other sections keep theirs.

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
- Clear glass on the dark hero: thickness 0.15, ior 1.6, dispersion 6, roughness 0.02, clearcoat 1, transmission 1, envMapIntensity 3.6, envPreset "wide" (broad softboxes on a near-black #0a0a0a base so faces keep a faint hint on black; the original thin-strip rig stays the module default), depthScale 0.65, offset x 0.55 over the line ends, backdrop takes the section background, text plane at z -0.8, fit 1.9, offset x 1.2 (over the line ends), depthScale 0.6, swing ±0.55 rad instead of a full spin
  (owner asked for thinner, less displacement). Light rig untouched. Vendored
  additions: backdrop.size, repaintBackdrop(), darkCore (unused). Change the look
  only with the owner.

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
