"use client";
// Client component: the inbox. List with unread emphasis, a detail drawer
// with notes and a reply template, and a pipeline board with drag between
// columns (keyboard: the status select in the drawer).

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status";
import { markInquiryRead, saveInquiryNotes, updateInquiryStatus, type InquiryStatus } from "@/lib/admin/actions";
import type { InquiryRow } from "@/lib/admin/queries";
import { cx } from "@/lib/cx";

const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "REPLIED", label: "Replied" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

function when(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function replyHref(q: InquiryRow, siteName: string): string {
  const subject = `Re: your enquiry to ${siteName}`;
  const body = [
    `Hi ${q.name.split(" ")[0]},`,
    "",
    "Thanks for writing. ",
    "",
    "",
    "Arif",
    siteName,
    "",
    "You wrote:",
    ...q.message.split("\n").map((l) => `> ${l}`),
  ].join("\n");
  return `mailto:${encodeURIComponent(q.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Drawer({ q, siteName, onClose, onStatus }: { q: InquiryRow; siteName: string; onClose: () => void; onStatus: (id: string, s: InquiryStatus) => void }) {
  const [notes, setNotes] = useState(q.internalNotes ?? "");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <aside aria-label={`Enquiry from ${q.name}`} className="border border-divider-light rounded-lg bg-paper p-3 flex flex-col gap-3 lg:sticky lg:top-3 self-start max-h-[calc(100svh-80px)] overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-h4 font-medium text-ink max-w-none">{q.name}</p>
          <p className="text-small text-ash max-w-none">{q.company ? `${q.company}, ` : ""}<a href={`mailto:${q.email}`}>{q.email}</a>{q.phone ? `, ${q.phone}` : ""}</p>
          <p className="data text-ash max-w-none mt-[2px]" suppressHydrationWarning>{when(q.createdAt)}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <div className="w-[200px]"><InquiryStatusSelect key={q.id + q.status} id={q.id} status={q.status} label="Status" onChanged={(s) => onStatus(q.id, s)} /></div>
      <p className="text-body text-ink whitespace-pre-wrap max-w-none border-t border-divider-light pt-2">{q.message}</p>
      <dl className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-[2px] text-small border-t border-divider-light pt-2">
        <dt className="text-ash">budget</dt><dd className="data">{q.budgetBand ?? ""}</dd>
        <dt className="text-ash">timeline</dt><dd className="data">{q.timelineBand ?? ""}</dd>
        <dt className="text-ash">looking at</dt><dd>{q.sourceProject ? <Link href={`/admin/projects/${q.sourceProject.id}`}>{q.sourceProject.title}</Link> : ""}</dd>
        <dt className="text-ash">sent from</dt><dd className="data break-all">{q.sourcePath ?? ""}</dd>
        <dt className="text-ash">referrer</dt><dd className="data break-all">{q.referrer ?? ""}</dd>
      </dl>
      <div className="flex flex-wrap gap-2 border-t border-divider-light pt-2">
        <Button size="sm" href={replyHref(q, siteName)} onClick={() => { if (q.status === "NEW" || q.status === "READ") onStatus(q.id, "REPLIED"); }}>Reply by email</Button>
      </div>
      <div className="border-t border-divider-light pt-2">
        <label htmlFor="notes" className="text-small text-ash">Internal notes</label>
        <Textarea id="notes" value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(null); }} rows={4} className="mt-1 min-h-[96px]" />
        <div className="mt-1 flex items-center gap-2">
          <Button size="sm" variant="secondary" pending={pending} disabled={notes === (q.internalNotes ?? "")} onClick={() => start(async () => { setError(null); const r = await saveInquiryNotes(q.id, notes); if (r.ok) setSaved("Notes saved."); else setError(r.error); })}>Save notes</Button>
          {saved ? <span role="status" className="text-small text-ash">{saved}</span> : null}
          {error ? <span role="alert" className="text-small text-status-error">{error}</span> : null}
        </div>
      </div>
    </aside>
  );
}

function Card({ q, onOpen, dragging }: { q: InquiryRow; onOpen: () => void; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: q.id });
  return (
    <li ref={setNodeRef} style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined} className={cx("bg-paper border border-divider-light rounded-lg p-2 flex flex-col gap-[4px]", dragging && "opacity-50")}>
      <div className="flex items-start gap-1">
        <button type="button" {...attributes} {...listeners} aria-label={`Move ${q.name}`} className="cursor-grab active:cursor-grabbing text-ash hover:text-ink mt-[2px] touch-none">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.4" /><circle cx="9" cy="3" r="1.4" /><circle cx="3" cy="8" r="1.4" /><circle cx="9" cy="8" r="1.4" /><circle cx="3" cy="13" r="1.4" /><circle cx="9" cy="13" r="1.4" /></svg>
        </button>
        <button type="button" onClick={onOpen} className="text-left min-w-0 flex-1">
          <span className="block text-small font-medium text-ink truncate">{q.name}</span>
          <span className="block text-small text-ash truncate">{q.company ?? q.email}</span>
        </button>
      </div>
      <p className="text-small text-ash max-w-none line-clamp-2">{q.message}</p>
      {q.budgetBand ? <p className="data text-ash max-w-none">{q.budgetBand}</p> : null}
    </li>
  );
}

function Column({ status, label, items, onOpen, activeId }: { status: InquiryStatus; label: string; items: InquiryRow[]; onOpen: (id: string) => void; activeId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} aria-label={label} className={cx("min-w-[220px] flex-1 rounded-lg border p-1 flex flex-col gap-1 transition-colors dur-fast", isOver ? "border-lime bg-paper" : "border-divider-light bg-bone")}>
      <p className="text-small font-medium text-ink max-w-none px-1 py-[4px] flex justify-between"><span>{label}</span><span className="data text-ash">{items.length}</span></p>
      <ul className="list-none m-0 p-0 flex flex-col gap-1 min-h-[40px]">
        {items.map((q) => <Card key={q.id} q={q} onOpen={() => onOpen(q.id)} dragging={activeId === q.id} />)}
      </ul>
    </section>
  );
}

export function InquiriesInbox({ rows: initial, siteName }: { rows: InquiryRow[]; siteName: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [rows, setRows] = useState(initial);
  useEffect(() => setRows(initial), [initial]);
  const [view, setView] = useState<"list" | "board">("list");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const open = rows.find((r) => r.id === openId) ?? null;

  useEffect(() => {
    if (open && open.status === "NEW") {
      setRows((s) => s.map((r) => (r.id === open.id ? { ...r, status: "READ" } : r)));
      markInquiryRead(open.id).then((r) => { if (!r.ok) setError(r.error); else router.refresh(); });
    }
  }, [open, router]);

  const filtered = useMemo(
    () => rows.filter((r) => (!status || r.status === status) && (!q || `${r.name} ${r.email} ${r.company ?? ""} ${r.message}`.toLowerCase().includes(q.toLowerCase()))),
    [rows, status, q],
  );
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s.value, rows.filter((r) => r.status === s.value).length])) as Record<InquiryStatus, number>, [rows]);

  function setStatusLocal(id: string, s: InquiryStatus) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: s } : r)));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = String(e.active.id);
    const to = e.over ? (String(e.over.id) as InquiryStatus) : null;
    const row = rows.find((r) => r.id === id);
    if (!to || !row || row.status === to) return;
    const prev = row.status;
    setStatusLocal(id, to);
    updateInquiryStatus(id, to).then((r) => { if (!r.ok) { setStatusLocal(id, prev); setError(r.error); } else router.refresh(); });
  }

  const selectOpen = (id: string | null) => {
    setOpenId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("id", id); else url.searchParams.delete("id");
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div role="tablist" aria-label="View" className="flex border border-divider-light rounded-sm overflow-hidden">
          {(["list", "board"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} type="button" onClick={() => setView(v)} className={cx("h-[32px] px-2 text-small font-medium transition-colors dur-fast", view === v ? "bg-ink text-bone" : "text-ash hover:text-ink")}>{v === "list" ? "List" : "Pipeline"}</button>
          ))}
        </div>
        {view === "list" ? (
          <>
            <div className="w-[240px]">
              <label htmlFor="iq" className="sr-only">Search</label>
              <Input id="iq" placeholder="Search name, email, message" value={q} onChange={(e) => setQ(e.target.value)} className="h-[32px] text-small" />
            </div>
            <div className="w-[150px]">
              <label htmlFor="is" className="sr-only">Status</label>
              <Select id="is" value={status} onChange={(e) => setStatus(e.target.value)} className="h-[32px] text-small">
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label} ({counts[s.value]})</option>)}
              </Select>
            </div>
          </>
        ) : null}
        {/* A file download from a route handler, not a page: a plain anchor is correct. */}
        <a href="/admin/inquiries/export" download className="ml-auto text-small font-medium text-ash hover:text-ink no-underline h-[32px] inline-flex items-center">Export CSV</a>
      </div>
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}

      {view === "list" ? (
        <div className={cx("grid gap-3", open ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
          {filtered.length === 0 ? (
            <p className="text-body text-ash py-3">{rows.length === 0 ? "No enquiries yet. They arrive here when someone sends the contact form." : "Nothing matches. Clear the filters to see everything."}</p>
          ) : (
            <ol className="list-none m-0 p-0 border-t border-divider-light">
              {filtered.map((r) => (
                <li key={r.id} className={cx("border-b border-divider-light", r.status === "NEW" && "is-active bg-paper", openId === r.id && "bg-paper")}>
                  <button type="button" onClick={() => selectOpen(r.id)} aria-current={openId === r.id ? "true" : undefined} className="w-full text-left grid grid-cols-[minmax(0,1fr)_90px] md:grid-cols-[minmax(0,1fr)_120px_100px_140px] gap-2 items-baseline px-2 py-2">
                    <span className="min-w-0">
                      <span className={cx("block text-body truncate", r.status === "NEW" ? "font-medium text-ink" : "text-ink")}>{r.name}{r.company ? <span className="text-ash font-normal">, {r.company}</span> : null}</span>
                      <span className="block text-small text-ash truncate">{r.message}</span>
                    </span>
                    <span className="hidden md:block data text-ash truncate">{r.budgetBand ?? ""}</span>
                    <span className="hidden md:block text-small text-ash">{STATUSES.find((s) => s.value === r.status)?.label}</span>
                    <span className="data text-ash text-right" suppressHydrationWarning>{new Date(r.createdAt).toLocaleDateString([], { day: "2-digit", month: "short" })}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          {open ? <Drawer key={open.id} q={open} siteName={siteName} onClose={() => selectOpen(null)} onStatus={setStatusLocal} /> : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUSES.map((s) => <Column key={s.value} status={s.value} label={s.label} items={rows.filter((r) => r.status === s.value)} onOpen={selectOpen} activeId={activeId} />)}
            </div>
            <DragOverlay>{activeId ? <div className="bg-paper border border-ink rounded-lg p-2 text-small font-medium w-[220px]">{rows.find((r) => r.id === activeId)?.name}</div> : null}</DragOverlay>
          </DndContext>
          {open ? <Drawer key={open.id} q={open} siteName={siteName} onClose={() => selectOpen(null)} onStatus={setStatusLocal} /> : null}
        </div>
      )}
    </div>
  );
}
