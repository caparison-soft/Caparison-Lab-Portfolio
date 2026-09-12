import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env/schema";

// Fail the build, not the first request, when a variable is missing.
validateEnv(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Media is served from R2 with sharp-generated variants. Vercel's
    // optimiser must never sit in front of it (quota, and it redoes sharp's work).
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(admin|styleguide)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
