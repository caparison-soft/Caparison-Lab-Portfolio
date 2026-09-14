import "server-only";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import ffmpegStatic from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export const IMAGE_WIDTHS = [400, 800, 1200, 1920] as const;
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_SOFT_BYTES = 15 * 1024 * 1024;
export const VIDEO_HARD_BYTES = 200 * 1024 * 1024;
/** How much of a video the confirm step reads for probing and the poster before falling back to the whole file. */
export const VIDEO_HEAD_BYTES = 16 * 1024 * 1024;
export const VIDEO_MAX_HEIGHT = 1080;
export const VIDEO_MAX_WIDTH = 1920;

export type ImageVariants = { width: number; height: number; blurDataUrl: string; files: { name: string; body: Buffer }[] };

/**
 * The four WebP variants plus a 16px blur placeholder. Nothing is upscaled:
 * a small original still gets every key so the srcset never 404s.
 */
export async function makeImageVariants(original: Buffer): Promise<ImageVariants> {
  const base = sharp(original, { failOn: "error" }).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Could not read the image dimensions.");

  const files = await Promise.all(
    IMAGE_WIDTHS.map(async (w) => ({
      name: `w${w}.webp`,
      body: await sharp(original).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer(),
    })),
  );
  const blur = await sharp(original).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  return { width, height, blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`, files };
}

/** A poster from an uploaded image: JPEG, 1280 wide max. */
export async function makePoster(image: Buffer): Promise<Buffer> {
  return sharp(image).rotate().resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
}

export type VideoProbe = { width: number; height: number; durationSec: number };

function ffmpegBinary(): string {
  const bin = process.env.FFMPEG_PATH ?? ffmpegStatic;
  if (!bin) throw new Error("ffmpeg binary not found. Install ffmpeg-static or set FFMPEG_PATH.");
  return bin;
}

/** Dimensions and duration from ffmpeg's own stream report. No ffprobe needed. */
export async function probeVideo(video: Buffer, ext: string): Promise<VideoProbe> {
  const dir = await mkdtemp(path.join(tmpdir(), "cl-video-"));
  const input = path.join(dir, `in.${ext}`);
  try {
    await writeFile(input, video);
    // ffmpeg prints the stream report on stderr whether or not it exits 0.
    let stderr = "";
    let spawnError = "";
    try {
      const r = await execFileAsync(ffmpegBinary(), ["-hide_banner", "-i", input, "-f", "null", "-t", "0", "-"], { maxBuffer: 4 * 1024 * 1024 });
      stderr = r.stderr;
    } catch (e) {
      stderr = (e as { stderr?: string }).stderr ?? "";
      spawnError = e instanceof Error ? e.message : String(e);
    }
    const dim = stderr.match(/Video:.*?\s(\d{2,5})x(\d{2,5})/);
    const dur = stderr.match(/Duration:\s(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!dim) {
      const detail = stderr.trim().split("\n").slice(-2).join(" ") || spawnError;
      throw new Error(`ffmpeg could not read the video stream. Is it H.264 MP4 or WebM? ${detail ? `(${detail.slice(0, 200)})` : ""}`.trim());
    }
    const durationSec = dur ? Math.round(Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3])) : 0;
    return { width: Number(dim[1]), height: Number(dim[2]), durationSec };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Frame 0 as a JPEG poster. */
export async function extractPoster(video: Buffer, ext: string): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), "cl-poster-"));
  const input = path.join(dir, `in.${ext}`);
  const output = path.join(dir, "poster.jpg");
  try {
    await writeFile(input, video);
    await execFileAsync(ffmpegBinary(), ["-hide_banner", "-loglevel", "error", "-y", "-ss", "0", "-i", input, "-frames:v", "1", "-q:v", "3", output]);
    return makePoster(await readFile(output));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
