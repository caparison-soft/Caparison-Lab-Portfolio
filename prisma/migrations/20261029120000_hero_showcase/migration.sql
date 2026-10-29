-- Written by hand: `prisma migrate diff` cannot introspect this database
-- because of the auth.users reference (same reason as 20260914180000).
--
-- The home hero's rotating case card picks its projects from this flag, kept
-- separate from `featured` so changing what the hero shows does not also
-- change the nav panel and the homepage list.
ALTER TABLE "Project" ADD COLUMN "showInHero" BOOLEAN NOT NULL DEFAULT false;

-- Project already has RLS enabled with a published-read policy; a new column
-- on an existing table needs no policy of its own.
