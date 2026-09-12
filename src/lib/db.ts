import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

/**
 * Prisma 7 requires a driver adapter. We use pg against the Supabase
 * pooler (port 6543). `max: 1` is the adapter equivalent of the
 * `connection_limit=1` query flag: each serverless instance holds one
 * connection so concurrent lambdas do not exhaust the free-tier pool.
 *
 * Module-level singleton so hot reloads and warm lambdas reuse the client.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: 1 });
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
