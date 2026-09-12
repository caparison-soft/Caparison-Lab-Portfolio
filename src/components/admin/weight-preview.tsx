"use client";
// Client component: shows how the capability sheet packs with a given weight.

import type { SimpleRow } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";

const span: Record<number, string> = { 3: "col-span-2 row-span-2", 2: "col-span-3", 1: "" };

export function WeightPreview({ values, rows, editingId }: { values: Record<string, unknown>; rows: SimpleRow[]; editingId: string | null }) {
  const weight = Math.min(3, Math.max(1, Number(values.weight ?? 1)));
  const items = rows.map((r) => ({ id: r.id, title: r.id === editingId ? String(values.title ?? r.title) : r.title, weight: r.id === editingId ? weight : Number(r.values.weight ?? 1), live: r.id === editingId }));
  if (!editingId) items.push({ id: "new", title: String(values.title || "New capability"), weight, live: true });
  return (
    <div className="bg-paper border border-divider-light rounded-lg p-3">
      <p className="text-small text-ash max-w-none mb-2">Homepage sheet preview. Small = one cell, medium = a full row, large = two by two.</p>
      <div className="sheet grid-cols-3 [grid-auto-flow:dense]">
        {items.map((it) => (
          <div key={it.id} className={cx("p-1 min-h-[48px] text-small bg-bone", span[it.weight], it.live && "bg-lime text-ink")}>{it.title}</div>
        ))}
      </div>
    </div>
  );
}
