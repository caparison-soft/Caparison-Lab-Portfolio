"use client";
// Client component: the library grid with filters, search, a detail drawer
// and deletion that names the projects still using an item.

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { deleteMedia } from "@/lib/admin/media-actions";
import type { MediaRow, ReconcileReport } from "@/lib/admin/media-queries";
import { cx } from "@/lib/cx";

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");
const thumb = (m: MediaRow) => (m.type === "VIDEO" ? `${cdn}/${m.posterKey ?? `${m.keyPrefix}/poster.jpg`}` : `${cdn}/${m.keyPrefix}/w400.webp`);
const mb = (n: number | null) => (n == null ? "" : n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaLibrary({ rows: initial, report }: { rows: MediaRow[]; report: ReconcileReport | null }) {
  const [rows, setRows] = useState(initial);
  const [type, setType] = useState("");
  const [orphans, setOrphans] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const filtered = useMemo(
    () => rows.filter((m) => (!type || m.type === type) && (!orphans || m.isOrphan) && (!q || `${m.alt ?? ""} ${m.caption ?? ""}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, type, orphans, q],
  );
  const current = rows.find((m) => m.id === open) ?? null;

  async function remove(m: MediaRow) {
    setError(null);
    const r = await deleteMedia(m.id);
    if (!r.ok) { setError(r.error); return; }
    setRows((s) => s.filter((x) => x.id !== m.id));
    setOpen(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-[240px]">
          <label htmlFor="mq" className="sr-only">Search alt and caption</label>
          <Input id="mq" placeholder="Search alt text and captions" value={q} onChange={(e) => setQ(e.target.value)} className="h-[32px] text-small" />
        </div>
        <div className="w-[140px]">
          <label htmlFor="mt" className="sr-only">Type</label>
          <Select id="mt" value={type} onChange={(e) => setType(e.target.value)} className="h-[32px] text-small"><option value="">All types</option><option value="IMAGE">Images</option><option value="VIDEO">Videos</option></Select>
        </div>
        <label className="inline-flex items-center gap-1 text-small h-[32px]"><input type="checkbox" checked={orphans} onChange={(e) => setOrphans(e.target.checked)} className="w-2 h-2 accent-[#D6F631]" />Unused only</label>
        <span className="text-small text-ash">{filtered.length} of {rows.length}</span>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setShowUpload((s) => !s)}>{showUpload ? "Close upload" : "Upload to library"}</Button>
      </div>
      {showUpload ? <MediaUploader projectId={null} onUploaded={(m) => setRows((s) => [{ ...m, mimeType: null, blurDataUrl: null, variants: null, createdAt: new Date().toISOString(), project: null, usedAsCoverBy: [], usedInlineBy: [], isOrphan: true }, ...s])} /> : null}
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}

      {report ? (
        <div className="border border-divider-light rounded-lg bg-paper p-2 text-small">
          <p className="max-w-none text-ink">
            Last R2 check <span suppressHydrationWarning>{new Date(report.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>: {report.totalObjects} objects, {mb(report.totalBytes)}.
            {report.orphanPrefixes.length > 0 ? ` ${report.orphanPrefixes.length} folder${report.orphanPrefixes.length === 1 ? "" : "s"} in R2 with no record here.` : " No stray folders in R2."}
            {report.missingObjects.length > 0 ? ` ${report.missingObjects.length} record${report.missingObjects.length === 1 ? "" : "s"} whose files are missing.` : ""}
          </p>
          {report.orphanPrefixes.length > 0 ? (
            <ul className="mt-1 list-none m-0 p-0 flex flex-col gap-[2px]">
              {report.orphanPrefixes.slice(0, 20).map((o) => <li key={o.prefix} className="data text-ash">{o.prefix}  {o.objects} objects  {mb(o.bytes)}</li>)}
            </ul>
          ) : null}
          <p className="mt-1 text-ash max-w-none">Nothing is deleted automatically. Clear stray folders from the R2 dashboard once you have checked them.</p>
        </div>
      ) : null}

      <div className={cx("grid gap-3", current ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1")}>
        {filtered.length === 0 ? (
          <p className="text-body text-ash py-3">{rows.length === 0 ? "No media yet. Upload the first image from a project, or here." : "Nothing matches. Clear the filters to see everything."}</p>
        ) : (
          <ul className="list-none m-0 p-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {filtered.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setOpen(m.id === open ? null : m.id)} aria-pressed={open === m.id} className={cx("block w-full text-left rounded-lg border overflow-hidden bg-paper transition-colors dur-fast", open === m.id ? "border-ink" : "border-divider-light hover:border-ash")}>
                  <span className="block aspect-[16/10] bg-bone overflow-hidden">
                    <img src={thumb(m)} alt={m.alt ?? ""} width={m.width ?? 16} height={m.height ?? 10} className="w-full h-full object-cover" loading="lazy" />
                  </span>
                  <span className="block p-1">
                    <span className="block text-small text-ink truncate">{m.alt || m.caption || (m.project ? `${m.project.title} ${m.type === "VIDEO" ? "video" : "image"}` : m.type === "VIDEO" ? "Untitled video" : "Untitled image")}</span>
                    <span className="block data text-ash truncate">{m.type === "VIDEO" ? `video  ${m.durationSec ?? 0}s` : `${m.width}x${m.height}`}{m.isOrphan ? "  unused" : ""}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {current ? (
          <aside className="border border-divider-light rounded-lg bg-paper p-3 self-start lg:sticky lg:top-3 flex flex-col gap-2" aria-label="Media details">
            <div className="aspect-[16/10] bg-bone rounded-sm overflow-hidden"><img src={thumb(current)} alt={current.alt ?? ""} className="w-full h-full object-contain" /></div>
            <p className="text-body text-ink max-w-none">{current.alt || "No alt text"}</p>
            {current.caption ? <p className="text-small text-ash max-w-none">{current.caption}</p> : null}
            <dl className="grid grid-cols-[96px_1fr] gap-x-2 gap-y-[2px] text-small">
              <dt className="text-ash">type</dt><dd className="data">{current.mimeType ?? current.type.toLowerCase()}</dd>
              <dt className="text-ash">size</dt><dd className="data">{current.width}x{current.height}  {mb(current.sizeBytes)}</dd>
              {current.durationSec != null ? <><dt className="text-ash">duration</dt><dd className="data">{current.durationSec}s</dd></> : null}
              <dt className="text-ash">key</dt><dd className="data break-all">{current.keyPrefix}</dd>
              <dt className="text-ash">added</dt><dd className="data" suppressHydrationWarning>{new Date(current.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</dd>
            </dl>
            <div className="text-small">
              <p className="text-ash max-w-none">used by</p>
              {current.project || current.usedAsCoverBy.length > 0 || current.usedInlineBy.length > 0 ? (
                <ul className="list-none m-0 p-0 mt-[2px] flex flex-col gap-[2px]">
                  {current.project ? <li><Link href={`/admin/projects/${current.project.id}`}>{current.project.title}</Link> <span className="text-ash">gallery</span></li> : null}
                  {current.usedAsCoverBy.map((p) => <li key={p.id}><Link href={`/admin/projects/${p.id}`}>{p.title}</Link> <span className="text-ash">cover</span></li>)}
                  {current.usedInlineBy.map((p) => <li key={p.id}><Link href={`/admin/projects/${p.id}`}>{p.title}</Link> <span className="text-ash">in the body</span></li>)}
                </ul>
              ) : <p className="text-ink max-w-none">Nothing. Safe to delete.</p>}
            </div>
            <div className="flex gap-2 pt-1 border-t border-divider-light">
              <Button size="sm" variant="destructive" onClick={() => remove(current)}>Delete</Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(null)}>Close</Button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
