"use client";
// Client component: drag-and-drop multi-upload. Browser PUTs straight to R2
// via presigned URLs with a real progress bar; alt text is required before
// an image can be sent. Videos over 15 MB are compressed in the browser
// first (ffmpeg.wasm, see lib/client/compress-video) so what reaches R2 is
// under 60 MB; an optional poster frame can be attached.

import { useRef, useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { confirmUpload, requestUpload, type ConfirmedMedia, type MediaSlot } from "@/lib/admin/media-actions";
import { compressVideo } from "@/lib/client/compress-video";
import { cx } from "@/lib/cx";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const SOFT = 15 * 1024 * 1024;
/** Originals above this are refused before compression (the browser has to hold them in memory). */
const INPUT_MAX = 500 * 1024 * 1024;
const IMAGE_MAX = 8 * 1024 * 1024;

type Item = {
  id: string;
  file: File;
  kind: "image" | "video";
  previewUrl: string;
  title: string;
  alt: string;
  caption: string;
  poster: File | null;
  progress: number;
  state: "queued" | "compressing" | "uploading" | "processing" | "done" | "error";
  /** Set once the browser has re-encoded the video. */
  compressed?: { from: number; to: number };
  error?: string;
  warning?: string;
};

function mb(n: number): string {
  return n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check the connection and the bucket CORS rule."));
    xhr.send(file);
  });
}

type UploaderProps = {
  projectId: string | null;
  onUploaded: (m: ConfirmedMedia) => void;
  compact?: boolean;
  /** Where the upload goes. Library uploads leave this unset. */
  slot?: MediaSlot;
  /** One file at a time (thumbnail, hero). */
  single?: boolean;
  /** Gallery and video items carry a title and a subtitle shown on the site. */
  titled?: boolean;
  /** Replaces the drop zone's first line. */
  prompt?: string;
};

const ACCEPT: Record<MediaSlot, string[]> = {
  THUMBNAIL: IMAGE_TYPES, HERO: [...IMAGE_TYPES, ...VIDEO_TYPES], GALLERY: IMAGE_TYPES, VIDEO: VIDEO_TYPES,
};

export function MediaUploader({ projectId, onUploaded, compact = false, slot, single = false, titled = false, prompt }: UploaderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const accept = slot ? ACCEPT[slot] : [...IMAGE_TYPES, ...VIDEO_TYPES];
  const acceptsImage = accept.some((t) => t.startsWith("image/"));
  const acceptsVideo = accept.some((t) => t.startsWith("video/"));
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(files: FileList | File[]) {
    const next: Item[] = [];
    const list = single ? Array.from(files).slice(0, 1) : Array.from(files);
    for (const file of list) {
      const kind = VIDEO_TYPES.includes(file.type) ? "video" : IMAGE_TYPES.includes(file.type) ? "image" : null;
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const base: Item = { id, file, kind: kind ?? "image", previewUrl: "", title: "", alt: "", caption: "", poster: null, progress: 0, state: "error" };
      if (!kind) { next.push({ ...base, error: "Not a supported type. Images: JPEG, PNG, WebP, AVIF. Video: MP4, WebM." }); continue; }
      if (!accept.includes(file.type)) { next.push({ ...base, kind, error: acceptsVideo && !acceptsImage ? "This section takes video only (MP4 or WebM)." : "This slot takes an image (JPEG, PNG, WebP, AVIF)." }); continue; }
      if (kind === "image" && file.size > IMAGE_MAX) { next.push({ ...base, kind, error: `Over 8 MB (${mb(file.size)}). Export it smaller.` }); continue; }
      if (kind === "video" && file.size > INPUT_MAX) { next.push({ ...base, kind, error: `Over 500 MB (${mb(file.size)}). Trim it or export it smaller first, or use a YouTube or Vimeo link.` }); continue; }
      next.push({
        ...base, kind, previewUrl: URL.createObjectURL(file), state: "queued",
        warning: kind === "video" && file.size > SOFT ? `${mb(file.size)}. Will be compressed in this browser before upload (1080p H.264, under 60 MB). This takes a few minutes; keep the tab open.` : undefined,
      });
    }
    setItems((s) => (single ? next : [...s, ...next]));
  }

  const patch = (id: string, p: Partial<Item>) => setItems((s) => s.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const ready = items.filter((i) => i.state === "queued");
  const canSend = ready.length > 0 && ready.every((i) => i.kind === "video" || i.alt.trim().length > 0);

  async function sendAll() {
    setBusy(true);
    for (const item of ready) {
      try {
        let file = item.file;
        if (item.kind === "video" && file.size > SOFT) {
          patch(item.id, { state: "compressing", progress: 0, warning: undefined });
          const r = await compressVideo(file, (ratio) => patch(item.id, { progress: Math.round(ratio * 100) }));
          file = r.file;
          if (!r.skipped) patch(item.id, { compressed: { from: r.originalBytes, to: file.size } });
        }
        patch(item.id, { state: "uploading", progress: 0 });
        const t = await requestUpload({ filename: file.name, mimeType: file.type, size: file.size, kind: item.kind, projectId, slot });
        if (!t.ok) throw new Error(t.error);
        await putWithProgress(t.uploadUrl, file, (pct) => patch(item.id, { progress: pct }));
        let posterExt: string | undefined;
        if (item.kind === "video" && item.poster) {
          const pt = await requestUpload({ filename: item.poster.name, mimeType: item.poster.type, size: item.poster.size, kind: "poster", videoKeyPrefix: t.keyPrefix });
          if (!pt.ok) throw new Error(pt.error);
          await putWithProgress(pt.uploadUrl, item.poster, () => {});
          posterExt = pt.ext;
        }
        patch(item.id, { state: "processing", progress: 100 });
        const c = await confirmUpload({ keyPrefix: t.keyPrefix, ext: t.ext, kind: item.kind, projectId, slot, title: item.title.trim(), alt: item.alt.trim(), caption: item.caption.trim(), posterExt });
        if (!c.ok) throw new Error(c.error);
        patch(item.id, { state: "done", warning: c.media.warning ?? item.warning });
        onUploaded(c.media);
      } catch (e) {
        patch(item.id, { state: "error", error: e instanceof Error ? e.message : "Upload failed." });
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Add files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
        className={cx("rounded-lg border border-dashed transition-colors dur-fast cursor-pointer text-center", compact ? "p-2" : "p-4", dragging ? "border-ink bg-paper" : "border-ash bg-bone hover:bg-paper")}
      >
        <p className="text-body text-ink max-w-none">{prompt ?? (acceptsImage && acceptsVideo ? "Drop images or videos here, or choose files." : acceptsImage ? (single ? "Drop an image here, or choose a file." : "Drop images here, or choose files.") : (single ? "Drop a video here, or choose a file." : "Drop videos here, or choose files."))}</p>
        <p className="text-small text-ash max-w-none mt-[4px]">
          {acceptsImage ? "JPEG, PNG, WebP, AVIF up to 8 MB." : null}{acceptsImage && acceptsVideo ? " " : null}{acceptsVideo ? "MP4 or WebM; over 15 MB is compressed here to under 60 MB, 1080p." : null}
        </p>
        <input ref={inputRef} type="file" multiple={!single} accept={accept.join(",")} className="sr-only" onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
      </div>

      {items.length > 0 ? (
        <ul className="list-none m-0 p-0 flex flex-col gap-2">
          {items.map((it) => (
            <li key={it.id} className={cx("grid grid-cols-[96px_minmax(0,1fr)] gap-2 items-start border border-divider-light rounded-lg p-2 bg-paper", it.state === "error" && "border-status-error")}>
              <div className="w-[96px] h-[60px] rounded-sm bg-bone border border-divider-light overflow-hidden">
                {it.previewUrl ? (it.kind === "video" ? <video src={it.previewUrl} muted className="w-full h-full object-cover" /> : <img src={it.previewUrl} alt="" className="w-full h-full object-cover" />) : null}
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <p className="text-small text-ink max-w-none truncate">{it.file.name} <span className="data text-ash">{mb(it.file.size)}</span></p>
                {it.state === "queued" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {titled ? (
                      <Field id={`title-${it.id}`} label="Title" help="Shown over the slide on the site.">
                        <Input value={it.title} onChange={(e) => patch(it.id, { title: e.target.value })} className="h-[32px] text-small" maxLength={120} />
                      </Field>
                    ) : null}
                    {titled ? (
                      <Field id={`cap-${it.id}`} label="Subtitle" help="One line under the title. Optional.">
                        <Input value={it.caption} onChange={(e) => patch(it.id, { caption: e.target.value })} className="h-[32px] text-small" maxLength={300} />
                      </Field>
                    ) : null}
                    <Field id={`alt-${it.id}`} label={it.kind === "image" ? "Alt text (required)" : "Description (optional)"} className={titled ? "md:col-span-2" : undefined}>
                      <Input value={it.alt} onChange={(e) => patch(it.id, { alt: e.target.value })} className="h-[32px] text-small" placeholder={it.kind === "image" ? "What the image shows, for screen readers" : ""} />
                    </Field>
                    {!titled ? (
                      <Field id={`cap-${it.id}`} label="Caption">
                        <Input value={it.caption} onChange={(e) => patch(it.id, { caption: e.target.value })} className="h-[32px] text-small" />
                      </Field>
                    ) : null}
                    {it.kind === "video" ? (
                      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                        <label className="text-small text-ash">
                          Poster frame (optional, else frame 0 is used)
                          <input type="file" accept={IMAGE_TYPES.join(",")} className="ml-1 text-small" onChange={(e) => patch(it.id, { poster: e.target.files?.[0] ?? null })} />
                        </label>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {it.state === "compressing" || it.state === "uploading" || it.state === "processing" ? (
                  <div>
                    <div className="h-[6px] bg-bone border border-divider-light rounded-full overflow-hidden" role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-lime transition-[width] dur-fast" style={{ width: `${it.progress}%` }} />
                    </div>
                    <p className="data text-ash max-w-none mt-[4px]">{it.state === "processing" ? "processing" : it.state === "compressing" ? `compressing ${it.progress}%` : `uploading ${it.progress}%`}</p>
                  </div>
                ) : null}
                {it.state === "done" ? <p className="text-small text-ink max-w-none">Uploaded.{it.compressed ? ` Compressed ${mb(it.compressed.from)} to ${mb(it.compressed.to)}.` : ""}</p> : null}
                {it.warning ? <p className="text-small text-status-warn max-w-none">{it.warning}</p> : null}
                {it.error ? <p role="alert" className="text-small text-status-error max-w-none">{it.error}</p> : null}
                {it.state === "queued" || it.state === "error" || it.state === "done" ? (
                  <div><Button size="sm" variant="ghost" onClick={() => setItems((s) => s.filter((x) => x.id !== it.id))}>{it.state === "done" ? "Clear" : "Remove"}</Button></div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {ready.length > 0 ? (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={sendAll} disabled={!canSend} pending={busy}>Upload {ready.length} {ready.length === 1 ? "file" : "files"}</Button>
          {!canSend ? <span className="text-small text-ash">Every image needs alt text before it can be uploaded.</span> : null}
        </div>
      ) : null}
    </div>
  );
}
