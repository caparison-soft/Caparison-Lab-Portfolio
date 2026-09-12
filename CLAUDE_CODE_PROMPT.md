# Claude Code brief — Caparison Lab portfolio + CMS

Saved copy of the opening brief. The design plan that was approved from it is
in docs/PHASE0_DESIGN_PLAN.md. Sections below are the parts future sessions
must check before working: the stack, the hard rules, the data model, and the
phase list. See the brand guide for colour, type, voice and layout.

## Stack — locked, don't substitute

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js` colours) |
| DB | Supabase Postgres |
| ORM | Prisma (pooled connection at runtime, direct for migrations) |
| Auth | Supabase Auth, email + password, single seeded admin, signup disabled |
| Media | Cloudflare R2 (S3 API) behind `cdn.caparisonlab.com` |
| Image processing | `sharp` at upload time, variants written to R2 |
| Rich text | Tiptap, stored as JSON, rendered server-side |
| Forms | react-hook-form + Zod, shared schemas between client and server actions |
| Motion | `motion` |
| Admin tables | TanStack Table |
| Reordering | dnd-kit |
| Email | Resend |
| Validation | Zod everywhere, including env vars |
| Deploy | Vercel |

Mutations go through server actions, not API routes, except the R2
presigned-upload endpoint and the Resend webhook. No component library with
its own design language. Unstyled Radix only, styled with our tokens.

## Supabase rules
- Two connection strings: `DATABASE_URL` (pooler, 6543, `pgbouncer=true`,
  `connection_limit=1`) and `DIRECT_URL` (5432) for migrations.
- RLS on every table, deny-all default, narrow anon SELECT only for published
  public rows. `Inquiry`, `Profile`, `AuditLog`, `ContentBlock` get no anon policy.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- `@supabase/ssr` with the App Router cookie pattern. Middleware protects
  `/admin/*` by session AND `Profile.role`.
- No Supabase Storage. All media on R2.
- Free tier: keepalive cron every 3 days (load-bearing), Prisma singleton,
  weekly `pg_dump` backup to R2 keeping the last eight, Resend as custom SMTP.

## R2 rules
- One bucket `caparison-media`, custom domain, never the `pub-*.r2.dev` URL.
- Upload: server action returns a presigned PUT (5 min); browser PUTs directly;
  confirm action derives dimensions and `blurDataUrl` with sharp, writes
  w400/w800/w1200/w1920 WebP variants, creates the `Media` row. Never proxy bytes.
- Keys: `projects/{projectId}/{nanoid}/original.{ext}` + variants;
  `video/{nanoid}/source.mp4` + `poster.jpg`; `backups/{iso-date}.sql.gz`.
- Store the key prefix, derive URLs from `NEXT_PUBLIC_CDN_URL`.
- Images `jpeg|png|webp|avif`, 8 MB, MIME-sniffed. Video `mp4|webm`, 1080p,
  15 MB soft / 60 MB hard cap, poster required (ffmpeg frame 0 fallback),
  `preload="metadata"`, `playsinline`, no autoplay with sound.
- Deleting a `Media` row deletes every object under its prefix, loudly.
- Weekly orphan reconciliation reports, never auto-deletes.

## Hard rules — an automatic fail

**Colour**
1. No violet, indigo, or blue-violet gradient anywhere.
2. No gradient-filled headline text.
3. No colour outside `caparison-tokens.css`.
4. No lime text on `bone`, `paper`, or white.
5. No tinted near-black. The brand dark is `olive-950`.
6. The signature gradient appears on the logo and at most one large decorative
   mark per page. Never behind text, never on a button, never a section background.

**Type**
7. No third typeface. Satoshi and JetBrains Mono only.
8. No Inter. No Poppins.
9. No ALL-CAPS tracked-out eyebrow labels above headings.
10. No colouring, italicising, or bolding one word in a headline for emphasis.
11. Monospace only where the content is genuinely code or machine data.
12. Sentence case everywhere.

**Layout**
13. Not every section is `heading + subheading + three equal cards`.
14. Not one border-radius on everything. Three-step scale by element type.
15. No soft grey box-shadow under cards. Elevation is borders and background steps.
16. No glassmorphism, no `backdrop-filter` blur panels.
17. Section heights vary.
18. Numbered markers only where content is genuinely a sequence.

**Content and chrome**
19. No emoji anywhere in the UI.
20. No "→" appended to button or link text.
21. No meta strings joined with middle dots.
22. No stock illustration, no 3D blobs, no angled floating device mockups.
23. No lorem ipsum. Real, specific placeholder copy in the brand voice.
24. No "elevate," "cutting-edge," "seamless," "passionate about," "we're not
    just a studio, we're a partner."

**Motion**
25. No scroll-triggered fade-up on more than one element on the entire site.
26. No typewriter effects, no blinking cursors, no counting-up number animations.
27. No auto-rotating testimonial carousel.

## Motion spec
- One orchestrated moment: the hero reveal on first load, ~700 ms, 60 ms stagger,
  `--ease-out`. Nothing else animates on load.
- At most one scroll-triggered reveal on the whole site (work index first row).
- Work rows: hover/focus cross-fades the thumbnail, draws the lime rule, steps
  the background. 120 ms.
- Case page: view transition on the cover image, `motion` fallback.
- Admin: motion only confirms actions.
- `prefers-reduced-motion: reduce` kills every transform and opacity animation.

## Data model
See prisma/schema.prisma. Every `slug`, `status`, `order` indexed. Soft-delete
on `Project` and `Testimonial`. Every public string is a `ContentBlock`
(seeded in prisma/seed.ts). Additions agreed in Phase 0:
`Project.currentlyBuilding`, `Project.buildNote`, `ProcessStep.duration`,
`ContentBlock.defaultValue` (for reset-to-default).

## Admin panel
Route group `/admin`, middleware-protected, noindex. Same brand, denser.
Screens: dashboard, projects (table + tabbed editor with autosave), content
(grouped copy editor with reset-to-default), capabilities (weight selector with
live sheet preview), testimonials, process, faqs, team, stats, media library
(orphan filter, block delete of in-use media), inquiries (inbox + kanban + CSV),
settings. Optimistic UI with rollback, Zod on both sides, inviting empty states,
typed confirmation for destructive project actions, `revalidateTag` on every
mutation, login rate-limited and logged, usable at 768 px and above.

## Public routes
`/`, `/work` (URL-driven filters), `/work/[slug]` (ISR), `/capabilities`
(single index page, decided in Phase 0), `/about`, `/contact`,
`/api/og/[slug]`, `sitemap.xml`, `robots.txt`, RSS, JSON-LD, 404 from ContentBlock.

## Build phases
0 plan, 1 foundation, 2 design system, 3 homepage, 4 work index and case
study, 5 auth and admin shell, 6 admin CRUD, 7 media and R2, 8 enquiries,
9 polish. Stop at the end of each phase, show the work, wait.

## Quality floor
Responsive 360–2560 (test 390, 768, 1024, 1440). Keyboard-complete with visible
focus and a skip link. axe zero violations. Reduced motion respected.
Lighthouse 95+ on performance, accessibility, best practices. No layout shift.
TS strict, zero `any`, zero build warnings. Env validated with Zod at build.
RLS verified. Keepalive verified. No R2 keys in the client bundle. Server
components by default, with a comment on every `"use client"`.

After each visual phase: Playwright screenshot, three honest criticisms,
fix them, then remove one thing.
