import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR";
};

/**
 * The signed-in user with their Profile row, or null. A valid session alone
 * is not authorisation: the Profile must exist and carry a role.
 * Memoised per request with React cache().
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { id: true, email: true, name: true, role: true } });
  if (!profile) return null;
  return { id: profile.id, email: profile.email, name: profile.name, role: profile.role };
});

/** For layouts and pages: redirect if not signed in or not authorised. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/login?error=forbidden");
  return user;
}

/** For server actions: throw instead of redirect so the caller can show an error. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authorised. Sign in again.");
  return user;
}
