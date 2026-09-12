"use client";
// Browser client. Not used by the login form (which posts to a server action
// so failed attempts can be rate-limited and audited server-side). Kept for
// client flows that need it later, such as password reset.

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";

export function createClient() {
  return createBrowserClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
