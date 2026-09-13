-- Only the first auth user becomes ADMIN. Everyone after that is EDITOR, so an
-- open sign-up endpoint can never mint an administrator. Promote in the
-- Profile table when needed.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  INSERT INTO public."Profile" (id, email, role, "createdAt")
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN EXISTS (SELECT 1 FROM public."Profile" WHERE role = 'ADMIN') THEN 'EDITOR'::"Role" ELSE 'ADMIN'::"Role" END,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;
