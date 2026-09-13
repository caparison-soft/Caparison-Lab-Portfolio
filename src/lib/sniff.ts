/** MIME detection from magic bytes. Extensions and declared types are never trusted. */

export type SniffedMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif" | "video/mp4" | "video/webm";

export const IMAGE_MIMES: readonly SniffedMime[] = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const VIDEO_MIMES: readonly SniffedMime[] = ["video/mp4", "video/webm"];

export function sniffMime(buf: Buffer): SniffedMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    // Any other ISO base media file: treat as MP4 (isom, iso2, mp41, mp42, M4V, ...)
    return "video/mp4";
  }
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return "video/webm";
  return null;
}

export const EXT: Record<SniffedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
