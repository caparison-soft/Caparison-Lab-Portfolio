import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: connection URLs live here, not in schema.prisma.
// The CLI (migrate, introspect) must use the DIRECT connection on port 5432.
// Runtime uses DATABASE_URL through the pooler; see src/lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
