# Setup checklist

Things that have to be done in dashboards, not in code. Tick them in order.

## Supabase (region: ap-southeast-1, Singapore)
1. Create the project in ap-southeast-1. Save the database password.
2. Project Settings → Database → Connection string. Copy both:
   - Transaction pooler (port 6543) → `DATABASE_URL`, append `?pgbouncer=true&connection_limit=1`
   - Session / direct (port 5432) → `DIRECT_URL`
3. Project Settings → API: `NEXT_PUBLIC_SUPABASE_URL`, anon key →
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service role → `SUPABASE_SERVICE_ROLE_KEY`.
4. Authentication → Sign In / Providers → Email: turn OFF "Allow new users to
   sign up". Turn ON "Confirm email".
5. Project Settings → Auth → SMTP: enable custom SMTP with Resend
   (host smtp.resend.com, port 465, user `resend`, password = Resend API key,
   sender = the verified `RESEND_FROM` address).
6. Run migrations from your machine: `DIRECT_URL=... npm run db:migrate`, then
   `npm run db:seed`, then `npm run verify:rls`.
7. Authentication → Users → Add user: create the single admin (your email, a
   strong password, auto-confirm). The `on_auth_user_created` trigger creates
   the `Profile` row with role ADMIN.
8. Do NOT create any Storage buckets. Media is on R2.

## Cloudflare R2
1. R2 → Create bucket `caparison-media`. Location hint: Asia-Pacific.
2. Bucket → Settings → Public access → Connect domain: `cdn.caparisonlab.com`.
   Do not use the `pub-*.r2.dev` URL in production.
3. Bucket → Settings → CORS policy: paste `infra/r2-cors.json`.
4. R2 → Manage R2 API tokens → Create token, Object Read & Write, scoped to
   this bucket → `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Account ID →
   `R2_ACCOUNT_ID`.
5. Cloudflare → Caching → Cache Rules: for `cdn.caparisonlab.com/projects/*`
   and `/video/*`, set Edge TTL 1 year and Browser TTL 1 year. Objects are
   immutable (new upload = new key).

## Resend
1. Add and verify the `caparisonlab.com` domain.
2. Create an API key → `RESEND_API_KEY`. Set `RESEND_FROM` and
   `INQUIRY_NOTIFY_EMAIL`.

## Vercel
1. Import the repo. Framework: Next.js. Functions region: `sin1` (Singapore).
2. Integrations → Supabase: connect the project so the Supabase vars sync.
3. Add by hand: every R2 var, `RESEND_*`, `INQUIRY_NOTIFY_EMAIL`,
   `CRON_SECRET` (32+ random chars), `DRAFT_PREVIEW_SECRET`,
   `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_SITE_URL`.
4. Crons are declared in `vercel.json`. Vercel sends `CRON_SECRET` automatically
   as a bearer token. After the first deploy, open Settings → Cron Jobs and
   confirm `/api/cron/keepalive` is listed.

## GitHub (database backups)
The weekly backup runs as a GitHub Action, since Vercel functions have no
pg_dump. Repository → Settings → Secrets and variables → Actions, add:
`DIRECT_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET`. Run it once by hand from the Actions tab and confirm
`backups/<date>.sql.gz` appears in the bucket. Restore with
`gunzip < file.sql.gz | psql "$DIRECT_URL"`.

## Verify after first deploy
- `curl -i https://<site>/api/cron/keepalive` → 401
- `curl -i -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/keepalive` → 200
- With the anon key, `GET <supabase-url>/rest/v1/Inquiry` returns `[]`, and
  `GET .../Project?status=eq.DRAFT` returns `[]`.
- Upload one image from a project's Media tab. The browser PUT goes to
  `<account>.r2.cloudflarestorage.com` (CORS must allow it) and the variants
  appear at `https://cdn.caparisonlab.com/projects/...`.
- `curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/reconcile` → 200.
