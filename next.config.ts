import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env/schema";

// Fail the build, not the first request, when a variable is missing.
validateEnv(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Native binaries must be required from node_modules at runtime, not bundled.
  serverExternalPackages: ["sharp", "ffmpeg-static"],
  // The ffmpeg binary (45 MB) is not a JS import, so file tracing drops it
  // from the serverless bundle. Include it for the admin pages whose server
  // actions make video posters (media library, project editor).
  outputFileTracingIncludes: {
    "/admin/**": ["./node_modules/ffmpeg-static/ffmpeg"],
  },
  // Clients that read the initial HTML only get blocking metadata instead of
  // streamed metadata. The default list plus Lighthouse.
  htmlLimitedBots: /Chrome-Lighthouse|Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|Googlebot|AhrefsBot|SemrushBot/i,
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
