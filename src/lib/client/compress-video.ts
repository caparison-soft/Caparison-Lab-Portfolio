// Browser-side video compression, before a video leaves the admin's machine.
// Two engines, tried in order:
//  1. WebCodecs through mediabunny: the browser's own (usually hardware)
//     H.264 encoder. Chrome, Edge and Safari; runs at or above real time.
//  2. ffmpeg.wasm (single-threaded core, no cross-origin isolation needed):
//     software encode, several minutes for a long 1080p clip. Fallback for
//     browsers without WebCodecs H.264 (Firefox) and for inputs the first
//     engine cannot read.
// Either way: anything over the soft cap is re-encoded to H.264 MP4, at most
// 1080p, with the bitrate chosen so the result lands under the hard cap.
// Nothing runs on the server.

import type { FFmpeg } from "@ffmpeg/ffmpeg";

export const VIDEO_SOFT_BYTES = 15 * 1024 * 1024;
export const VIDEO_HARD_BYTES = 60 * 1024 * 1024;
/** Largest original the browser will take on (it has to hold it in memory while encoding). */
export const VIDEO_INPUT_MAX_BYTES = 500 * 1024 * 1024;

const CORE_BASE = "/ffmpeg";
/** Quality ceiling: above this bitrate a 1080p screen recording gains nothing visible. */
const MAX_VIDEO_KBPS = 6000;
const MIN_VIDEO_KBPS = 1200;
const AUDIO_KBPS = 128;
const TARGET_FILL = 0.85; // aim under the cap: encoders overshoot a target average bitrate
/** Passes allowed when an encoder still overshoots: each one scales the bitrate by what it missed by. */
const MAX_PASSES = 3;
const MAX_HEIGHT = 1080;
const MAX_WIDTH = 1920;

/** Video bitrate (kbps) that fills the cap for this duration, within the quality band, times `scale` for retries. */
function budgetKbps(seconds: number, scale = 1): number {
  const budget = seconds > 0 ? Math.floor((VIDEO_HARD_BYTES * 8 * TARGET_FILL) / seconds / 1000) - AUDIO_KBPS : MAX_VIDEO_KBPS;
  return Math.max(400, Math.min(MAX_VIDEO_KBPS, Math.floor(Math.max(MIN_VIDEO_KBPS, budget) * scale)));
}

export type CompressResult = { file: File; originalBytes: number; skipped: boolean; engine: "webcodecs" | "ffmpeg" | "none" };

/**
 * Re-encode `file` so it fits under the hard cap. Files already at or under
 * the soft cap are returned untouched. `onProgress` gets 0..1.
 */
export async function compressVideo(file: File, onProgress?: (ratio: number) => void): Promise<CompressResult> {
  if (file.size <= VIDEO_SOFT_BYTES) return { file, originalBytes: file.size, skipped: true, engine: "none" };
  if (file.size > VIDEO_INPUT_MAX_BYTES) throw new Error(`Over ${Math.round(VIDEO_INPUT_MAX_BYTES / 1048576)} MB. Trim or export it smaller first.`);

  // Encoders treat a target bitrate as a hint and can land over it. When a pass
  // overshoots the cap, run again with the bitrate scaled by what it missed by.
  const run = async (encode: (scale: number) => Promise<File>): Promise<File> => {
    let scale = 1;
    let out: File | null = null;
    for (let pass = 1; pass <= MAX_PASSES; pass++) {
      onProgress?.(0);
      out = await encode(scale);
      if (out.size <= VIDEO_HARD_BYTES) return out;
      scale *= (VIDEO_HARD_BYTES * TARGET_FILL) / out.size;
    }
    throw new Error(`Still ${Math.round((out as File).size / 1048576)} MB after compressing. Trim the video or use a YouTube or Vimeo link.`);
  };

  if (typeof VideoEncoder !== "undefined") {
    try {
      const out = await run((scale) => compressWithWebCodecs(file, onProgress, scale));
      return { file: out, originalBytes: file.size, skipped: false, engine: "webcodecs" };
    } catch (e) {
      if (e instanceof Error && /^Still \d+ MB/.test(e.message)) throw e;
      console.warn("WebCodecs compression unavailable, falling back to ffmpeg.wasm:", e);
    }
  }
  const out = await run((scale) => compressWithFfmpeg(file, onProgress, scale));
  return { file: out, originalBytes: file.size, skipped: false, engine: "ffmpeg" };
}

// ---- Engine 1: WebCodecs via mediabunny -----------------------------------

async function compressWithWebCodecs(file: File, onProgress: ((ratio: number) => void) | undefined, scale: number): Promise<File> {
  const mb = await import("mediabunny");
  const input = new mb.Input({ formats: mb.ALL_FORMATS, source: new mb.BlobSource(file) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("No video track.");
  const seconds = await input.computeDuration();
  const kbps = budgetKbps(seconds, scale);

  // Fit inside 1920x1080 without changing the aspect.
  const w = track.displayWidth;
  const h = track.displayHeight;
  const size: { width?: number; height?: number } = {};
  if (h > MAX_HEIGHT || w > MAX_WIDTH) {
    const scale = Math.min(MAX_HEIGHT / h, MAX_WIDTH / w);
    size.width = Math.round((w * scale) / 2) * 2;
    size.height = Math.round((h * scale) / 2) * 2;
  }

  // Constant mode: hardware encoders hold a CBR target far more tightly than a VBR average.
  const quality = new mb.Quality({ bitrate: kbps * 1000, bitrateMode: "constant" });
  if (!(await mb.canEncodeVideo("avc", { width: size.width ?? w, height: size.height ?? h, quality }))) throw new Error("This browser cannot encode H.264.");

  const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }), target: new mb.BufferTarget() });
  const conversion = await mb.Conversion.init({
    input,
    output,
    tracks: "primary",
    video: { codec: "avc", quality, forceTranscode: true, ...size, fit: "contain" },
    audio: { codec: "aac", bitrate: AUDIO_KBPS * 1000 },
  });
  if (!conversion.isValid) throw new Error(`Cannot convert: ${conversion.discardedTracks.map((d) => d.reason).join(", ") || "unknown reason"}`);
  conversion.onProgress = (p) => onProgress?.(Math.max(0, Math.min(1, p)));
  await conversion.execute();
  const buffer = output.target.buffer;
  if (!buffer) throw new Error("Encoder produced no output.");
  const name = file.name.replace(/\.[^.]+$/, "") + ".mp4";
  return new File([buffer], name, { type: "video/mp4" });
}

// ---- Engine 2: ffmpeg.wasm --------------------------------------------------
let instance: Promise<FFmpeg> | null = null;

async function ffmpeg(): Promise<FFmpeg> {
  if (!instance) {
    instance = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
      const ff = new FFmpeg();
      await ff.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ff;
    })().catch((e) => { instance = null; throw e; });
  }
  return instance;
}

/** Duration in seconds from ffmpeg's stream report (the probe pass does not decode). */
async function duration(ff: FFmpeg, input: string): Promise<number> {
  let log = "";
  const onLog = ({ message }: { message: string }) => { log += message + "\n"; };
  ff.on("log", onLog);
  try { await ff.exec(["-hide_banner", "-i", input, "-f", "null", "-t", "0", "-"]); } catch { /* ffmpeg exits non-zero after printing the report */ }
  ff.off("log", onLog);
  const m = log.match(/Duration:\s(\d+):(\d+):(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

async function compressWithFfmpeg(file: File, onProgress: ((ratio: number) => void) | undefined, scale: number): Promise<File> {
  const ff = await ffmpeg();
  const { fetchFile } = await import("@ffmpeg/util");
  const ext = file.name.toLowerCase().endsWith(".webm") ? "webm" : "mp4";
  const input = `in.${ext}`;
  const output = "out.mp4";
  await ff.writeFile(input, await fetchFile(file));

  try {
    const kbps = budgetKbps(await duration(ff, input), scale);

    const onProgress2 = ({ progress }: { progress: number }) => onProgress?.(Math.max(0, Math.min(1, progress)));
    ff.on("progress", onProgress2);
    try {
      await ff.exec([
        "-hide_banner", "-loglevel", "error", "-y",
        "-i", input,
        "-vf", "scale=-2:'min(1080,ih)'",
        "-c:v", "libx264", "-preset", "veryfast", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.4)}k`, "-bufsize", `${kbps * 2}k`,
        "-c:a", "aac", "-b:a", `${AUDIO_KBPS}k`, "-ac", "2",
        "-movflags", "+faststart",
        output,
      ]);
    } finally {
      ff.off("progress", onProgress2);
    }
    const data = await ff.readFile(output);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    const name = file.name.replace(/\.[^.]+$/, "") + ".mp4";
    return new File([bytes as BlobPart], name, { type: "video/mp4" });
  } finally {
    try { await ff.deleteFile(input); } catch { /* already gone */ }
    try { await ff.deleteFile(output); } catch { /* never written */ }
  }
}
