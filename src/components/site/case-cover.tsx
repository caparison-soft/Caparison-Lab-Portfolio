import { MediaFrame } from "@/components/ui";
import type { MediaItem } from "@/lib/queries/work";
import { embedSrc, imageSrcSet, posterSrc, videoSrc } from "@/lib/media";

type CaseCoverProps = {
  slug: string;
  cover: MediaItem | null;
  videoUrl: string | null;
  videoProvider: "R2" | "YOUTUBE" | "VIMEO";
  title: string;
};

/**
 * The cover: video if set, else the cover image, else a quiet placeholder
 * frame. Carries a view-transition-name shared with the index thumbnail so
 * supporting browsers morph it between pages.
 */
export function CaseCover({ slug, cover, videoUrl, videoProvider, title }: CaseCoverProps) {
  const vtStyle = { viewTransitionName: `cover-${slug}` } as React.CSSProperties;
  // .cover-in fades the frame in only where the View Transitions API is absent (see globals.css).

  if (videoUrl && videoProvider !== "R2") {
    const src = embedSrc(videoProvider, videoUrl);
    if (src) {
      return (
        <MediaFrame ratio={16 / 9} style={vtStyle} className="cover-in">
          <iframe src={src} title={title} loading="lazy" allow="fullscreen; picture-in-picture" className="absolute inset-0 w-full h-full border-0" />
        </MediaFrame>
      );
    }
  }

  if (videoUrl && videoProvider === "R2") {
    const keyPrefix = videoUrl.replace(/\/source\.mp4$/, "");
    return (
      <MediaFrame ratio={16 / 9} style={vtStyle} className="cover-in">
        <video controls preload="metadata" playsInline poster={posterSrc(cover?.posterKey ?? null, keyPrefix)}>
          <source src={videoSrc(keyPrefix)} type="video/mp4" />
        </video>
      </MediaFrame>
    );
  }

  if (cover) {
    return (
      <MediaFrame width={cover.width ?? 16} height={cover.height ?? 10} blurDataUrl={cover.blurDataUrl ?? undefined} style={vtStyle} className="cover-in">
        <img {...imageSrcSet(cover.keyPrefix, cover.variants)} sizes="(min-width: 1024px) 1000px, 100vw" alt={cover.alt ?? ""} width={cover.width ?? 16} height={cover.height ?? 10} fetchPriority="high" decoding="async" />
      </MediaFrame>
    );
  }

  // No media yet: render nothing. A placeholder frame would be decoration.
  return null;
}
