// Browser-side video compression with ffmpeg.wasm (single-threaded core, so
// no cross-origin isolation headers are needed). Used by the admin uploader
// before a video leaves the machine: anything over the soft cap is re-encoded
// to H.264 MP4, at most 1080p, with the bitrate chosen so the result lands
// under the hard cap. Nothing runs on the server.

import type { FFmpeg } from "@ffmpeg/ffmpeg";

export const VIDEO_SOFT_BYTES = 15 * 1024 * 1024;
export const VIDEO_HARD_BYTES = 60 * 1024 * 1024;
/** Largest original the browser will take on (it has to hold it in memory while encoding). */
export const VIDEO_INPUT_MAX_BYTES = 500 * 1024 * 1024;

const CORE_BASE = "/ffmpeg";
/** Quality ceiling: above this bitrate a 1080p screen recording gains nothing visible. */
const MAX_VIDEO_KBPS = 6000;
const AUDIO_KBPS = 128;
const TARGET_FILL = 0.9; // aim 10% under the cap so muxing overhead never tips it over

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

export type CompressResult = { file: File; originalBytes: number; skipped: boolean };

/**
 * Re-encode `file` so it fits under the hard cap. Files already at or under
 * the soft cap are returned untouched. `onProgress` gets 0..1.
 */
export async function compressVideo(file: File, onProgress?: (ratio: number) => void): Promise<CompressResult> {
  if (file.size <= VIDEO_SOFT_BYTES) return { file, originalBytes: file.size, skipped: true };
  if (file.size > VIDEO_INPUT_MAX_BYTES) throw new Error(`Over ${Math.round(VIDEO_INPUT_MAX_BYTES / 1048576)} MB. Trim or export it smaller first.`);

  const ff = await ffmpeg();
  const { fetchFile } = await import("@ffmpeg/util");
  const ext = file.name.toLowerCase().endsWith(".webm") ? "webm" : "mp4";
  const input = `in.${ext}`;
  const output = "out.mp4";
  await ff.writeFile(input, await fetchFile(file));

  try {
    const secs = await duration(ff, input);
    // Bitrate that fills the cap for this length, capped at the quality ceiling.
    const budgetKbps = secs > 0 ? Math.floor((VIDEO_HARD_BYTES * 8 * TARGET_FILL) / secs / 1000) - AUDIO_KBPS : MAX_VIDEO_KBPS;
    const kbps = Math.max(1200, Math.min(MAX_VIDEO_KBPS, budgetKbps));

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
    const out = new File([bytes as BlobPart], name, { type: "video/mp4" });
    if (out.size > VIDEO_HARD_BYTES) throw new Error(`Still ${Math.round(out.size / 1048576)} MB after compressing. Trim the video or use a YouTube or Vimeo link.`);
    return { file: out, originalBytes: file.size, skipped: false };
  } finally {
    try { await ff.deleteFile(input); } catch { /* already gone */ }
    try { await ff.deleteFile(output); } catch { /* never written */ }
  }
}
