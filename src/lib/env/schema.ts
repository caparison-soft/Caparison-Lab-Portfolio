import { z } from "zod";

/**
 * Environment contract. Imported by next.config.ts so a missing variable
 * fails `next build`, and by src/lib/env/index.ts for typed runtime access.
 * Keep this file free of server-only imports: next.config.ts loads it.
 */

const url = z.string().url();
const nonEmpty = z.string().min(1);

export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Supabase Postgres. Pooler (6543) for runtime, direct (5432) for migrations.
  DATABASE_URL: nonEmpty.refine(
    (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
    "DATABASE_URL must be a postgres connection string",
  ),
  DIRECT_URL: nonEmpty.refine(
    (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
    "DIRECT_URL must be a postgres connection string",
  ),

  // Supabase Auth. Service role key is server-only and never NEXT_PUBLIC_.
  SUPABASE_SERVICE_ROLE_KEY: nonEmpty,

  // Cloudflare R2 (S3 API). Keys are server-only.
  R2_ACCOUNT_ID: nonEmpty,
  R2_ACCESS_KEY_ID: nonEmpty,
  R2_SECRET_ACCESS_KEY: nonEmpty,
  R2_BUCKET: nonEmpty.default("caparison-media"),

  // Resend.
  RESEND_API_KEY: nonEmpty,
  RESEND_FROM: z.string().email().or(z.string().regex(/^.+<.+@.+>$/)),
  INQUIRY_NOTIFY_EMAIL: z.string().email(),

  // Vercel Cron bearer secret and draft preview signing secret.
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
  DRAFT_PREVIEW_SECRET: z.string().min(16, "DRAFT_PREVIEW_SECRET must be at least 16 characters"),
});

export const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
  NEXT_PUBLIC_CDN_URL: url,
  NEXT_PUBLIC_SITE_URL: url,
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

const SERVER_ONLY_SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_SECRET_ACCESS_KEY",
  "R2_ACCESS_KEY_ID",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "DRAFT_PREVIEW_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
] as const;

/**
 * Validate the full environment. Throws with a readable list of problems.
 * Also refuses to run if a server secret has been copied into a NEXT_PUBLIC_
 * variable, which would ship it to the browser.
 */
export function validateEnv(raw: NodeJS.ProcessEnv): ServerEnv & ClientEnv {
  const server = serverSchema.safeParse(raw);
  const client = clientSchema.safeParse(raw);

  const problems: string[] = [];
  if (!server.success) {
    for (const issue of server.error.issues) problems.push(`${issue.path.join(".")}: ${issue.message}`);
  }
  if (!client.success) {
    for (const issue of client.error.issues) problems.push(`${issue.path.join(".")}: ${issue.message}`);
  }

  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith("NEXT_PUBLIC_") || !value) continue;
    for (const secretKey of SERVER_ONLY_SECRETS) {
      const secret = raw[secretKey];
      if (secret && secret.length >= 8 && value.includes(secret)) {
        problems.push(`${key} contains the value of ${secretKey}. Server secrets must never be NEXT_PUBLIC_.`);
      }
    }
  }

  if (problems.length > 0 || !server.success || !client.success) {
    throw new Error(
      `Environment validation failed:\n  - ${problems.join("\n  - ")}\n\nSee .env.example for every required variable.`,
    );
  }

  return { ...server.data, ...client.data };
}
