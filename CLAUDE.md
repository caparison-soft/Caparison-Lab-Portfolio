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

## Voice
Plain, specific, understated. Numbers over adjectives. Sentence case.
Buttons say what happens. No emoji. No "elevate", "seamless", "cutting-edge".
No middle dots between meta items. No "→" on links.
