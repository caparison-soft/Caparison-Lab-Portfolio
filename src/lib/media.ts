/** URL helpers for R2 media. Keys are stored; URLs are derived here from the CDN host. */

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");

export const IMAGE_WIDTHS = [400, 800, 1200, 1920] as const;

export function mediaUrl(key: string): string {
  return `${cdn}/${key.replace(/^\//, "")}`;
}

/** srcset from the stored variants; falls back to the conventional keys. */
export function imageSrcSet(keyPrefix: string, variants: Record<string, string> | null): { src: string; srcSet: string } {
  const entries = IMAGE_WIDTHS.map((w) => {
    const key = variants?.[`w${w}`] ?? `${keyPrefix}/w${w}.webp`;
    return { w, url: mediaUrl(key) };
  });
  return {
    src: entries[1].url,
    srcSet: entries.map((e) => `${e.url} ${e.w}w`).join(", "),
  };
}

export function videoSrc(keyPrefix: string): string {
  return mediaUrl(`${keyPrefix}/source.mp4`);
}

export function posterSrc(posterKey: string | null, keyPrefix: string): string {
  return mediaUrl(posterKey ?? `${keyPrefix}/poster.jpg`);
}

/** YouTube / Vimeo URL to an embeddable src. Null if it does not parse. */
export function embedSrc(provider: "YOUTUBE" | "VIMEO", url: string): string | null {
  try {
    const u = new URL(url);
    if (provider === "YOUTUBE") {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    const id = u.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}?dnt=1` : null;
  } catch {
    return null;
  }
}
