"use client";
// Client component: the project's gallery. Upload, reorder, edit alt and
// caption inline, choose the cover image or cover video, delete.

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { SortableList } from "@/components/admin/sortable-list";
import { deleteMedia, reorderMedia, setCover, setCoverVideo, updateMedia, type ConfirmedMedia } from "@/lib/admin/media-actions";
import type { ProjectMediaItem } from "@/lib/admin/media-queries";
import { cx } from "@/lib/cx";

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");
const thumb = (m: { type: string; keyPrefix: string; posterKey: string | null }) => (m.type === "VIDEO" ? `${cdn}/${m.posterKey ?? `${m.keyPrefix}/poster.jpg`}` : `${cdn}/${m.keyPrefix}/w400.webp`);

type Props = { projectId: string; items: ProjectMediaItem[]; coverImageId: string | null; videoKeyPrefix: string | null };

export function ProjectMedia({ projectId, items: initial, coverImageId: initialCover, videoKeyPrefix: initialVideo }: Props) {
  const [items, setItems] = useState(initial);
  const [cover, setCoverId] = useState(initialCover);
  const [video, setVideo] = useState(initialVideo);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  function onUploaded(m: ConfirmedMedia) {
    setItems((s) => [...s, { id: m.id, type: m.type, keyPrefix: m.keyPrefix, posterKey: m.posterKey, alt: m.alt, caption: m.caption, width: m.width, height: m.height, durationSec: m.durationSec, sizeBytes: m.sizeBytes, order: m.order }]);
  }

  function reorder(ids: string[]) {
    const prev = items;
    setItems(ids.map((id) => items.find((i) => i.id === id)!));
    start(async () => { const r = await reorderMedia(projectId, ids); if (!r.ok) { setItems(prev); setError(r.error); } });
  }

  async function saveField(id: string, field: "alt" | "caption", value: string) {
    const r = await updateMedia(id, { [field]: value });
    if (!r.ok) setError(r.error);
    else setItems((s) => s.map((i) => (i.id === id ? { ...i, [field]: value || null } : i)));
  }

  async function makeCover(id: string | null) {
    const prev = cover; setCoverId(id);
    const r = await setCover(projectId, id);
    if (!r.ok) { setCoverId(prev); setError(r.error); }
  }

  async function makeVideo(keyPrefix: string | null, id: string | null) {
    const prev = video; setVideo(keyPrefix);
    const r = await setCoverVideo(projectId, id);
    if (!r.ok) { setVideo(prev); setError(r.error); }
  }

  async function remove(id: string) {
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    const r = await deleteMedia(id, { fromProjectId: projectId });
    if (!r.ok) { setItems(prev); setError(r.error); }
    else if (cover === id) setCoverId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <MediaUploader projectId={projectId} onUploaded={onUploaded} compact />
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-body text-ash">No media yet. The first image you upload can be set as the cover.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          className="border-t border-divider-light"
          itemClassName="border-b border-divider-light"
          renderItem={(m, handle) => {
            const isCover = cover === m.id;
            const isVideo = video === m.keyPrefix;
            return (
              <div className={cx("grid grid-cols-[24px_128px_minmax(0,1fr)] gap-2 items-start py-2 pr-1", (isCover || isVideo) && "is-active bg-paper")}>
                <span className="pl-1 pt-3">{handle}</span>
                <div className="w-[128px] h-[80px] rounded-sm bg-bone border border-divider-light overflow-hidden relative">
                  <img src={thumb(m)} alt="" width={128} height={80} className="w-full h-full object-cover" loading="lazy" />
                  {m.type === "VIDEO" ? <span className="absolute bottom-[4px] right-[4px] data text-mono-s bg-olive-950 text-bone px-[4px] rounded-sm">{m.durationSec ?? 0}s</span> : null}
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <label htmlFor={`m-alt-${m.id}`} className="text-small text-ash">{m.type === "IMAGE" ? "Alt text (required)" : "Description"}</label>
                      <Input id={`m-alt-${m.id}`} defaultValue={m.alt ?? ""} onBlur={(e) => { if (e.target.value !== (m.alt ?? "")) saveField(m.id, "alt", e.target.value); }} className={cx("h-[32px] text-small", m.type === "IMAGE" && !m.alt && "border-status-error")} />
                    </div>
                    <div>
                      <label htmlFor={`m-cap-${m.id}`} className="text-small text-ash">Caption</label>
                      <Input id={`m-cap-${m.id}`} defaultValue={m.caption ?? ""} onBlur={(e) => { if (e.target.value !== (m.caption ?? "")) saveField(m.id, "caption", e.target.value); }} className="h-[32px] text-small" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="data text-ash">{m.width}x{m.height}{m.sizeBytes ? `  ${m.sizeBytes >= 1024 * 1024 ? `${(m.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(m.sizeBytes / 1024)} KB`}` : ""}</span>
                    {m.type === "IMAGE" ? (
                      isCover ? <span className="text-small font-medium text-ink">Cover</span> : <Button size="sm" variant="ghost" onClick={() => makeCover(m.id)}>Set as cover</Button>
                    ) : isVideo ? (
                      <span className="text-small font-medium text-ink">Cover video <Button size="sm" variant="ghost" onClick={() => makeVideo(null, null)}>Unset</Button></span>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => makeVideo(m.keyPrefix, m.id)}>Use as cover video</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
      {cover ? <p className="text-small text-ash max-w-none">The cover shows on the index rail and at the top of the case page.</p> : null}
    </div>
  );
}
