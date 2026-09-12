"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** Durable rate limit: failed attempts are counted from AuditLog, so it holds across serverless instances. */
async function tooManyFailures(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const count = await prisma.auditLog.count({
    where: { action: "auth.login_failed", createdAt: { gte: since }, OR: [{ entityId: email }, { diff: { path: ["ip"], equals: ip } }] },
  });
  return count >= MAX_FAILURES;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Enter your email and password." };
  const { email, password } = parsed.data;
  const ip = await clientIp();

  if (await tooManyFailures(email, ip)) {
    await logAudit({ action: "auth.login_blocked", entity: "auth", entityId: email, diff: { ip } });
    return { error: `Too many failed attempts. Wait ${WINDOW_MINUTES} minutes and try again.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await logAudit({ action: "auth.login_failed", entity: "auth", entityId: email, diff: { ip, reason: error?.code ?? "unknown" } });
    return { error: "That email and password don't match. Check both and try again." };
  }

  const profile = await prisma.profile.findUnique({ where: { id: data.user.id }, select: { role: true } });
  if (!profile) {
    await supabase.auth.signOut();
    await logAudit({ action: "auth.login_no_profile", entity: "auth", entityId: email, diff: { ip, userId: data.user.id } });
    return { error: "This account isn't set up for the admin panel." };
  }

  await logAudit({ userId: data.user.id, action: "auth.login", entity: "auth", entityId: email, diff: { ip } });

  const next = parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user) await logAudit({ userId: user.id, action: "auth.logout", entity: "auth", entityId: user.email ?? null });
  redirect("/login");
}
