-- ============================================================
-- Auth wiring and Row Level Security.
--
-- Supabase exposes PostgREST over every table in public, reachable
-- with the anon key that ships to the browser. A table without RLS is
-- a table the internet can read and write. So: RLS on, deny-all by
-- default, narrow anon SELECT policies only for published public rows.
--
-- Prisma connects as the table owner, which bypasses RLS, so the app
-- is unaffected.
-- ============================================================

-- ---- Profile follows auth.users -------------------------------------
-- Guarded so the migration also applies to a Prisma shadow database
-- (which has no auth schema). On Supabase and on our local dev DB the
-- auth.users table exists and the FK + trigger are created.
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    ALTER TABLE public."Profile"
      ADD CONSTRAINT "Profile_auth_user_fkey"
      FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE;

    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $fn$
    BEGIN
      INSERT INTO public."Profile" (id, email, role, "createdAt")
      VALUES (NEW.id, NEW.email, 'ADMIN', now())
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $fn$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ---- RLS on, deny all -----------------------------------------------
ALTER TABLE public."Profile"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContentBlock"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSettings"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tag"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectTag"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Media"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Capability"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProcessStep"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Testimonial"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Faq"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeamMember"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Stat"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Inquiry"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog"      ENABLE ROW LEVEL SECURITY;

-- Prisma's own bookkeeping table must not be readable either.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- ---- Narrow anon SELECT for what the public site shows -------------
-- No policy at all on: Inquiry, Profile, AuditLog, ContentBlock,
-- _prisma_migrations. (ContentBlock is read server-side only.)

CREATE POLICY "published projects are public"
  ON public."Project" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND "deletedAt" IS NULL);

CREATE POLICY "metrics of published projects are public"
  ON public."ProjectMetric" FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Project" p
    WHERE p.id = "ProjectMetric"."projectId"
      AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL
  ));

CREATE POLICY "tags of published projects are public"
  ON public."ProjectTag" FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Project" p
    WHERE p.id = "ProjectTag"."projectId"
      AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL
  ));

CREATE POLICY "media of published projects is public"
  ON public."Media" FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public."Project" p
    WHERE p.id = "Media"."projectId"
      AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL
  ));

CREATE POLICY "tags are public"
  ON public."Tag" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "categories are public"
  ON public."Category" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "published capabilities are public"
  ON public."Capability" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "published process steps are public"
  ON public."ProcessStep" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "published testimonials are public"
  ON public."Testimonial" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND "deletedAt" IS NULL);

CREATE POLICY "published faqs are public"
  ON public."Faq" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "published team members are public"
  ON public."TeamMember" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "published stats are public"
  ON public."Stat" FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "site settings are public"
  ON public."SiteSettings" FOR SELECT TO anon, authenticated USING (true);
