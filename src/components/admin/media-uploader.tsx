"use client";
// Client component: drag-and-drop multi-upload. Browser PUTs straight to R2
// via presigned URLs with a real progress bar; alt text is required before
// an image can be sent; videos warn above 15 MB and take an optional poster.

import { useRef, useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { confirmUpload, requestUpload, type ConfirmedMedia } from "@/lib/admin/media-actions";
import { cx } from "@/lib/cx";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const SOFT = 15 * 1024 * 1024;
const HARD = 60 * 1024 * 1024;
const IMAGE_MAX = 8 * 1024 * 1024;

type Item = {
  id: string;
  file: File;
  kind: "image" | "video";
  previewUrl: string;
  alt: string;
  caption: string;
  poster: File | null;
  progress: number;
  state: "queued" | "uploading" | "processing" | "done" | "error";
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

export function MediaUploader({ projectId, onUploaded, compact = false }: { projectId: string | null; onUploaded: (m: ConfirmedMedia) => void; compact?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(files: FileList | File[]) {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      const kind = VIDEO_TYPES.includes(file.type) ? "video" : IMAGE_TYPES.includes(file.type) ? "image" : null;
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      if (!kind) { next.push({ id, file, kind: "image", previewUrl: "", alt: "", caption: "", poster: null, progress: 0, state: "error", error: "Not a supported type. Images: JPEG, PNG, WebP, AVIF. Video: MP4, WebM." }); continue; }
      if (kind === "image" && file.size > IMAGE_MAX) { next.push({ id, file, kind, previewUrl: "", alt: "", caption: "", poster: null, progress: 0, state: "error", error: `Over 8 MB (${mb(file.size)}). Export it smaller.` }); continue; }
      if (kind === "video" && file.size > HARD) { next.push({ id, file, kind, previewUrl: "", alt: "", caption: "", poster: null, progress: 0, state: "error", error: `Over the 60 MB hard cap (${mb(file.size)}). Compress it, or use a YouTube or Vimeo link.` }); continue; }
      next.push({
        id, file, kind, previewUrl: URL.createObjectURL(file), alt: "", caption: "", poster: null, progress: 0, state: "queued",
        warning: kind === "video" && file.size > SOFT ? `${mb(file.size)}. Over 15 MB is slow to start on mobile data in Bangladesh; a shorter or more compressed export is better.` : undefined,
      });
    }
    setItems((s) => [...s, ...next]);
  }

  const patch = (id: string, p: Partial<Item>) => setItems((s) => s.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const ready = items.filter((i) => i.state === "queued");
  const canSend = ready.length > 0 && ready.every((i) => i.kind === "video" || i.alt.trim().length > 0);

  async function sendAll() {
    setBusy(true);
    for (const item of ready) {
      try {
        patch(item.id, { state: "uploading", progress: 0 });
        const t = await requestUpload({ filename: item.file.name, mimeType: item.file.type, size: item.file.size, kind: item.kind, projectId });
        if (!t.ok) throw new Error(t.error);
        await putWithProgress(t.uploadUrl, item.file, (pct) => patch(item.id, { progress: pct }));
        let posterExt: string | undefined;
        if (item.kind === "video" && item.poster) {
          const pt = await requestUpload({ filename: item.poster.name, mimeType: item.poster.type, size: item.poster.size, kind: "poster", videoKeyPrefix: t.keyPrefix });
          if (!pt.ok) throw new Error(pt.error);
          await putWithProgress(pt.uploadUrl, item.poster, () => {});
          posterExt = pt.ext;
        }
        patch(item.id, { state: "processing", progress: 100 });
        const c = await confirmUpload({ keyPrefix: t.keyPrefix, ext: t.ext, kind: item.kind, projectId, alt: item.alt.trim(), caption: item.caption.trim(), posterExt });
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
        <p className="text-body text-ink max-w-none">Drop images or videos here, or choose files.</p>
        <p className="text-small text-ash max-w-none mt-[4px]">JPEG, PNG, WebP, AVIF up to 8 MB. MP4 or WebM up to 60 MB, 1080p, 15 MB recommended.</p>
        <input ref={inputRef} type="file" multiple accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")} className="sr-only" onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
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
                    <Field id={`alt-${it.id}`} label={it.kind === "image" ? "Alt text (required)" : "Description (optional)"}>
                      <Input value={it.alt} onChange={(e) => patch(it.id, { alt: e.target.value })} className="h-[32px] text-small" placeholder={it.kind === "image" ? "What the image shows" : ""} />
                    </Field>
                    <Field id={`cap-${it.id}`} label="Caption">
                      <Input value={it.caption} onChange={(e) => patch(it.id, { caption: e.target.value })} className="h-[32px] text-small" />
                    </Field>
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
                {it.state === "uploading" || it.state === "processing" ? (
                  <div>
                    <div className="h-[6px] bg-bone border border-divider-light rounded-full overflow-hidden" role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-lime transition-[width] dur-fast" style={{ width: `${it.progress}%` }} />
                    </div>
                    <p className="data text-ash max-w-none mt-[4px]">{it.state === "processing" ? "processing" : `${it.progress}%`}</p>
                  </div>
                ) : null}
                {it.state === "done" ? <p className="text-small text-ink max-w-none">Uploaded.</p> : null}
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
