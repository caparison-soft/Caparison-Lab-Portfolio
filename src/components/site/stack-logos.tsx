import * as si from "simple-icons";
import { cx } from "@/lib/cx";

/**
 * Stack tags as brand marks (Simple Icons, CC0), monochrome in the current
 * text colour, with the name in a tooltip on hover or focus and always for
 * screen readers. Anything without a mark stays a text tag. Server component.
 */

type Icon = { path: string; title: string };

/** Tag name (lowercased) to Simple Icons key. Only what the studio actually lists. */
const KEYS: Record<string, keyof typeof si> = {
  react: "siReact", "react native": "siReact", "react-native": "siReact",
  "next.js": "siNextdotjs", nextjs: "siNextdotjs", "next-js": "siNextdotjs",
  typescript: "siTypescript", javascript: "siJavascript",
  node: "siNodedotjs", "node.js": "siNodedotjs", nodejs: "siNodedotjs",
  python: "siPython", django: "siDjango", fastapi: "siFastapi",
  postgres: "siPostgresql", postgresql: "siPostgresql", mysql: "siMysql", mongodb: "siMongodb", redis: "siRedis", "redis streams": "siRedis", "redis-streams": "siRedis",
  supabase: "siSupabase", firebase: "siFirebase", prisma: "siPrisma",
  stripe: "siStripe", cloudflare: "siCloudflare", vercel: "siVercel", docker: "siDocker",
  storybook: "siStorybook", "tailwind css": "siTailwindcss", tailwind: "siTailwindcss", tailwindcss: "siTailwindcss",
  flutter: "siFlutter", kotlin: "siKotlin", swift: "siSwift", android: "siAndroid", ios: "siApple", expo: "siExpo",
  graphql: "siGraphql", figma: "siFigma", electron: "siElectron", redux: "siRedux",
  wordpress: "siWordpress", shopify: "siShopify", laravel: "siLaravel", php: "siPhp", go: "siGo", rust: "siRust",
  anthropic: "siAnthropic", "anthropic api": "siAnthropic", claude: "siClaude",
  chrome: "siGooglechrome", "chrome extension": "siGooglechrome", "chrome web store": "siChromewebstore",
  tauri: "siTauri", ffmpeg: "siFfmpeg", onnx: "siOnnx", "onnx runtime": "siOnnx", ollama: "siOllama",
};

function iconFor(name: string): Icon | null {
  const key = KEYS[name.trim().toLowerCase()];
  if (!key) return null;
  const icon = si[key] as { path: string; title: string } | undefined;
  return icon ? { path: icon.path, title: icon.title } : null;
}

/**
 * One mark for the marquee: a tile with the icon; on hover or focus the icon
 * slides up and the name appears inside the tile (an overlay outside the
 * tile would be clipped by the slider's overflow). Name is the aria-label.
 */
export function StackMark({ name, size = 26 }: { name: string; size?: number }) {
  const icon = iconFor(name);
  return (
    <span tabIndex={0} role="img" aria-label={name} className="stack-mark group relative inline-flex flex-col items-center justify-center h-[64px] w-[64px] rounded-lg bg-paper border border-divider-light text-ink transition-colors dur-fast hover:border-ash focus-visible:border-ash overflow-hidden">
      <span className="flex items-center justify-center transition-transform dur-base ease-out group-hover:-translate-y-[9px] group-focus-visible:-translate-y-[9px]">
        {icon ? <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg> : <span className="data text-small">{name}</span>}
      </span>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-[6px] text-center text-[11px] leading-none text-ash opacity-0 translate-y-[6px] transition-[opacity,transform] dur-base ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 truncate px-1">{name}</span>
    </span>
  );
}

export function StackLogos({ items, className, size = 20 }: { items: string[]; className?: string; size?: number }) {
  return (
    <ul className={cx("list-none m-0 p-0 flex flex-wrap items-center gap-1", className)}>
      {items.map((name) => {
        const icon = iconFor(name);
        return (
          <li key={name} className="relative group">
            {icon ? (
              <span tabIndex={0} role="img" aria-label={name} className="stack-logo inline-flex items-center justify-center h-[36px] w-[36px] rounded-sm bg-paper border border-divider-light text-ink transition-colors dur-fast hover:border-ash focus-visible:border-ash">
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg>
              </span>
            ) : (
              <span className="stack-tag data inline-flex items-center h-[36px] px-2 rounded-sm bg-paper border border-divider-light text-ink">{name}</span>
            )}
            {icon ? (
              <span role="tooltip" className="stack-tip pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded-sm bg-ink text-bone text-small px-1 py-[2px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity dur-fast z-20">
                {name}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
