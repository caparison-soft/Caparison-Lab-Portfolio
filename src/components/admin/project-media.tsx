"use client";
// Client component: a project's media in four slots. Thumbnail (one image,
// the home card), hero (one image or video, top of the case page), gallery
// (images with title and subtitle, the carousel) and videos (the videos
// section). Upload straight into a slot, reorder, edit text inline, remove.

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { SortableList } from "@/components/admin/sortable-list";
import { clearSlot, deleteMedia, reorderMedia, updateMedia, type ConfirmedMedia } from "@/lib/admin/media-actions";
import type { ProjectMediaItem, ProjectMediaState } from "@/lib/admin/media-queries";
import { cx } from "@/lib/cx";

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");
const thumb = (m: { type: string; keyPrefix: string; posterKey: string | null }) => (m.type === "VIDEO" ? `${cdn}/${m.posterKey ?? `${m.keyPrefix}/poster.jpg`}` : `${cdn}/${m.keyPrefix}/w400.webp`);
const size = (m: ProjectMediaItem) => `${m.width}x${m.height}${m.sizeBytes ? `  ${m.sizeBytes >= 1024 * 1024 ? `${(m.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(m.sizeBytes / 1024)} KB`}` : ""}${m.durationSec != null ? `  ${m.durationSec}s` : ""}`;

type Props = { projectId: string } & ProjectMediaState;

function toItem(m: ConfirmedMedia): ProjectMediaItem {
  return { id: m.id, type: m.type, slot: m.slot, keyPrefix: m.keyPrefix, posterKey: m.posterKey, title: m.title, alt: m.alt, caption: m.caption, width: m.width, height: m.height, durationSec: m.durationSec, sizeBytes: m.sizeBytes, order: m.order };
}

function SlotHeading({ title, help }: { title: string; help: string }) {
  return (
    <div>
      <h3 className="text-h4 font-medium text-ink m-0">{title}</h3>
      <p className="text-small text-ash max-w-[72ch] mt-[2px]">{help}</p>
    </div>
  );
}

/** Thumbnail and hero: one item, replace by uploading, or remove. */
function SingleSlot({ projectId, slot, item, onChange, onError }: { projectId: string; slot: "THUMBNAIL" | "HERO"; item: ProjectMediaItem | null; onChange: (m: ProjectMediaItem | null) => void; onError: (e: string | null) => void }) {
  const [, start] = useTransition();
  const remove = () => start(async () => {
    const r = await clearSlot(projectId, slot);
    if (r.ok) onChange(null); else onError(r.error);
  });
  return (
    <div className="flex flex-col gap-2">
      {item ? (
        <div className="grid grid-cols-[192px_minmax(0,1fr)] gap-2 items-start">
          <div className={cx("rounded-sm bg-bone border border-divider-light overflow-hidden relative", slot === "THUMBNAIL" ? "aspect-[16/9]" : "aspect-[16/10]")}>
            <img src={thumb(item)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            {item.type === "VIDEO" ? <span className="absolute bottom-[4px] right-[4px] data text-mono-s bg-olive-950 text-bone px-[4px] rounded-sm">video {item.durationSec ?? 0}s</span> : null}
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <p className="text-small text-ink max-w-none">{item.alt || item.title || "No description"}</p>
            <p className="data text-ash max-w-none">{size(item)}</p>
            <div><Button size="sm" variant="ghost" onClick={remove}>Remove</Button></div>
          </div>
        </div>
      ) : null}
      <MediaUploader
        projectId={projectId}
        slot={slot}
        single
        compact
        prompt={item ? (slot === "THUMBNAIL" ? "Drop a new image to replace the thumbnail." : "Drop a new image or video to replace the hero.") : undefined}
        onUploaded={(m) => onChange(toItem(m))}
      />
    </div>
  );
}

/** Gallery and videos: ordered lists with title, subtitle and alt inline. */
function ListSlot({ projectId, slot, items, setItems, onError }: { projectId: string; slot: "GALLERY" | "VIDEO"; items: ProjectMediaItem[]; setItems: (f: (s: ProjectMediaItem[]) => ProjectMediaItem[]) => void; onError: (e: string | null) => void }) {
  const [, start] = useTransition();

  function reorder(ids: string[]) {
    const byId = new Map(items.map((i) => [i.id, i]));
    const next = ids.map((id) => byId.get(id)!);
    setItems(() => next);
    start(async () => { const r = await reorderMedia(projectId, ids); if (!r.ok) { setItems(() => items); onError(r.error); } });
  }

  async function saveField(id: string, field: "title" | "alt" | "caption", value: string) {
    const r = await updateMedia(id, { [field]: value });
    if (!r.ok) onError(r.error);
    else setItems((s) => s.map((i) => (i.id === id ? { ...i, [field]: value || null } : i)));
  }

  async function remove(id: string) {
    const prev = items;
    setItems((s) => s.filter((i) => i.id !== id));
    const r = await deleteMedia(id, { fromProjectId: projectId });
    if (!r.ok) { setItems(() => prev); onError(r.error); }
  }

  return (
    <div className="flex flex-col gap-2">
      <MediaUploader projectId={projectId} slot={slot} titled compact onUploaded={(m) => setItems((s) => [...s, toItem(m)])} />
      {items.length === 0 ? (
        <p className="text-small text-ash max-w-none">{slot === "GALLERY" ? "No slides yet." : "No videos yet."}</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          className="border-t border-divider-light"
          itemClassName="border-b border-divider-light"
          renderItem={(m, handle, index) => (
            <div className="grid grid-cols-[24px_128px_minmax(0,1fr)] gap-2 items-start py-2 pr-1">
              <span className="pl-1 pt-3">{handle}</span>
              <div className="w-[128px] h-[80px] rounded-sm bg-bone border border-divider-light overflow-hidden relative">
                <img src={thumb(m)} alt="" width={128} height={80} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-[4px] left-[4px] data text-mono-s bg-olive-950 text-bone px-[4px] rounded-sm">{index + 1}</span>
                {m.type === "VIDEO" ? <span className="absolute bottom-[4px] right-[4px] data text-mono-s bg-olive-950 text-bone px-[4px] rounded-sm">{m.durationSec ?? 0}s</span> : null}
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div>
                    <label htmlFor={`m-title-${m.id}`} className="text-small text-ash">Title</label>
                    <Input id={`m-title-${m.id}`} defaultValue={m.title ?? ""} maxLength={120} onBlur={(e) => { if (e.target.value !== (m.title ?? "")) saveField(m.id, "title", e.target.value); }} className="h-[32px] text-small" />
                  </div>
                  <div>
                    <label htmlFor={`m-cap-${m.id}`} className="text-small text-ash">Subtitle</label>
                    <Input id={`m-cap-${m.id}`} defaultValue={m.caption ?? ""} maxLength={300} onBlur={(e) => { if (e.target.value !== (m.caption ?? "")) saveField(m.id, "caption", e.target.value); }} className="h-[32px] text-small" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor={`m-alt-${m.id}`} className="text-small text-ash">{m.type === "IMAGE" ? "Alt text (required)" : "Description"}</label>
                    <Input id={`m-alt-${m.id}`} defaultValue={m.alt ?? ""} onBlur={(e) => { if (e.target.value !== (m.alt ?? "")) saveField(m.id, "alt", e.target.value); }} className={cx("h-[32px] text-small", m.type === "IMAGE" && !m.alt && "border-status-error")} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="data text-ash">{size(m)}</span>
                  <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>Delete</Button>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

export function ProjectMedia({ projectId, items: initial, coverImageId, heroMediaId }: Props) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const thumbnail = items.find((i) => i.id === coverImageId) ?? items.find((i) => i.slot === "THUMBNAIL") ?? null;
  const hero = items.find((i) => i.id === heroMediaId) ?? items.find((i) => i.slot === "HERO") ?? null;
  const [thumbState, setThumb] = useState<ProjectMediaItem | null>(thumbnail);
  const [heroState, setHero] = useState<ProjectMediaItem | null>(hero);
  const gallery = items.filter((i) => i.slot === "GALLERY");
  const videos = items.filter((i) => i.slot === "VIDEO");
  const setSlot = (slot: "GALLERY" | "VIDEO") => (f: (s: ProjectMediaItem[]) => ProjectMediaItem[]) =>
    setItems((all) => {
      const next = f(all.filter((i) => i.slot === slot));
      return [...all.filter((i) => i.slot !== slot), ...next];
    });

  return (
    <div className="flex flex-col gap-5">
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}

      <section className="flex flex-col gap-2" aria-labelledby="slot-thumb">
        <SlotHeading title="Thumbnail" help="One image. Shows on the home page when someone hovers this project, and in the work index. 16:9, 1600x900 recommended; other shapes are cropped to fit." />
        <SingleSlot projectId={projectId} slot="THUMBNAIL" item={thumbState} onChange={(m) => { setThumb(m); setError(null); }} onError={setError} />
      </section>

      <section className="flex flex-col gap-2 border-t border-divider-light pt-4" aria-labelledby="slot-hero">
        <SlotHeading title="Hero" help="One image or video. Sits under the summary at the top of the case page. A video plays with controls. For YouTube or Vimeo instead, use the link fields below." />
        <SingleSlot projectId={projectId} slot="HERO" item={heroState} onChange={(m) => { setHero(m); setError(null); }} onError={setError} />
      </section>

      <section className="flex flex-col gap-2 border-t border-divider-light pt-4" aria-labelledby="slot-gallery">
        <SlotHeading title="Gallery" help="Images shown as a carousel on the case page, in this order. Each slide can carry a title and a subtitle." />
        <ListSlot projectId={projectId} slot="GALLERY" items={gallery} setItems={setSlot("GALLERY")} onError={setError} />
      </section>

      <section className="flex flex-col gap-2 border-t border-divider-light pt-4" aria-labelledby="slot-video">
        <SlotHeading title="Videos" help="Videos shown in their own section on the case page, in this order, each with a title and a subtitle." />
        <ListSlot projectId={projectId} slot="VIDEO" items={videos} setItems={setSlot("VIDEO")} onError={setError} />
      </section>
    </div>
  );
}
