import { MediaFrame } from "@/components/ui";
import { VideoPlayer } from "@/components/site/video-player";
import type { MediaItem } from "@/lib/queries/work";
import { embedSrc, imageSrcSet, posterSrc, videoSrc } from "@/lib/media";

type CaseCoverProps = {
  slug: string;
  /** The hero slot: one image or one uploaded video. */
  hero: MediaItem | null;
  /** A YouTube or Vimeo link takes precedence over the uploaded hero. */
  videoUrl: string | null;
  videoProvider: "R2" | "YOUTUBE" | "VIMEO";
  title: string;
};

/**
 * The hero under the summary: an embed if a link is set, else the uploaded
 * hero (video with controls, or image). Carries a view-transition-name
 * shared with the index thumbnail so supporting browsers morph between pages.
 */
export function CaseCover({ slug, hero, videoUrl, videoProvider, title }: CaseCoverProps) {
  const vtStyle = { viewTransitionName: `cover-${slug}` } as React.CSSProperties;

  if (videoUrl && videoProvider !== "R2") {
    const src = embedSrc(videoProvider, videoUrl);
    if (src) {
      return (
        <MediaFrame ratio={16 / 9} style={vtStyle} className="cover-in case-hero">
          <iframe src={src} title={title} loading="lazy" allow="fullscreen; picture-in-picture" className="absolute inset-0 w-full h-full border-0" />
        </MediaFrame>
      );
    }
  }

  if (!hero) return null;

  if (hero.type === "VIDEO") {
    return (
      <MediaFrame width={hero.width ?? 16} height={hero.height ?? 9} style={vtStyle} className="cover-in case-hero">
        <VideoPlayer src={videoSrc(hero.keyPrefix)} poster={posterSrc(hero.posterKey, hero.keyPrefix)} label={hero.alt ?? title} width={hero.width ?? 16} height={hero.height ?? 9} />
      </MediaFrame>
    );
  }

  return (
    <MediaFrame width={hero.width ?? 16} height={hero.height ?? 10} blurDataUrl={hero.blurDataUrl ?? undefined} style={vtStyle} className="cover-in case-hero">
      <img {...imageSrcSet(hero.keyPrefix, hero.variants)} sizes="(min-width: 1024px) 1000px, 100vw" alt={hero.alt ?? ""} width={hero.width ?? 16} height={hero.height ?? 10} fetchPriority="high" decoding="async" />
    </MediaFrame>
  );
}
