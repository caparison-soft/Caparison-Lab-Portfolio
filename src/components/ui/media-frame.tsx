import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type MediaFrameProps = {
  /** width / height. Reserves space so nothing shifts when the image lands. */
  ratio?: number;
  /** Or explicit intrinsic dimensions; ratio is derived. */
  width?: number;
  height?: number;
  radius?: "lg" | "none";
  surface?: Surface;
  /** Tiny base64 image painted behind the media while it loads. */
  blurDataUrl?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * A frame for an image or video: fixed aspect ratio, 12px radius, one
 * background step, hairline border. Children fill it with object-fit cover.
 */
export function MediaFrame({ ratio, width, height, radius = "lg", surface = "light", blurDataUrl, className, style, children }: MediaFrameProps) {
  const aspect = ratio ?? (width && height ? width / height : 16 / 10);
  return (
    <div
      className={cx(
        "media-frame relative overflow-hidden w-full",
        radius === "lg" ? "rounded-lg" : "rounded-none",
        surface === "dark" ? "bg-olive-800 border border-olive-600" : "bg-paper border border-divider-light",
        "[&>img]:absolute [&>img]:inset-0 [&>img]:w-full [&>img]:h-full [&>img]:object-cover",
        "[&>video]:absolute [&>video]:inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover",
        className,
      )}
      style={{
        aspectRatio: String(aspect),
        ...(blurDataUrl ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
