-- Written by hand: `prisma migrate diff` cannot introspect this database
-- because of the auth.users reference (same reason as 20260914180000).
--
-- Every project says whose it is: a client's, the studio's own product, or a
-- concept built for a fictional business. The public site labels each card and
-- case page with it, so a concept is never read as a client result.
CREATE TYPE "ProjectKind" AS ENUM ('CLIENT', 'INTERNAL', 'CONCEPT');
ALTER TABLE "Project" ADD COLUMN "kind" "ProjectKind" NOT NULL DEFAULT 'CLIENT';

-- Project already has RLS enabled with a published-read policy; a new column
-- on an existing table needs no policy of its own.
