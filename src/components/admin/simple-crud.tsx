"use client";
// Client component: reorderable list with inline editing for the simple entities.

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { EntityForm, type FieldDef } from "@/components/admin/entity-form";
import { SortableList } from "@/components/admin/sortable-list";
import { Toggle } from "@/components/admin/toggle";
import { deleteEntity, reorderEntity, saveEntity, toggleEntity } from "@/lib/admin/entity-actions";
import type { EntityName } from "@/lib/admin/schemas";
import type { SimpleRow } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";
import { WeightPreview } from "@/components/admin/weight-preview";

type SimpleCrudProps = {
  entity: EntityName;
  rows: SimpleRow[];
  fields: FieldDef[];
  singular: string;
  plural: string;
  emptyState: string;
  blank: Record<string, unknown>;
  featuredToggle?: boolean;
  /** Named side panel, rendered beside the form. Serialisable so server pages can pass it. */
  aside?: "weightPreview";
};

export function SimpleCrud({ entity, rows: initialRows, fields, singular, plural, emptyState, blank, featuredToggle, aside }: SimpleCrudProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  // router.refresh() delivers new props; keep local state in step with them.
  useEffect(() => setRows(initialRows), [initialRows]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  function refresh() { router.refresh(); }

  function onReorder(ids: string[]) {
    const prev = rows;
    setRows(ids.map((id) => rows.find((r) => r.id === id)!));
    start(async () => {
      const r = await reorderEntity(entity, ids);
      if (!r.ok) { setRows(prev); setError(r.error); }
    });
  }

  async function onDelete(id: string) {
    const prev = rows;
    setRows(rows.filter((r) => r.id !== id));
    setConfirmId(null);
    const r = await deleteEntity(entity, id);
    if (!r.ok) { setRows(prev); setError(r.error); }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-small text-ash max-w-none">{rows.length} {rows.length === 1 ? singular : plural}. Drag to reorder.</p>
        {!adding ? <Button size="sm" onClick={() => { setAdding(true); setEditing(null); }}>Add {singular}</Button> : null}
      </div>
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}

      {adding ? (
        <div className="border border-divider-light rounded-lg bg-paper p-3">
          <p className="text-h4 font-medium mb-2">New {singular}</p>
          <EntityForm
            fields={fields}
            initial={blank}
            idPrefix="new"
            submitLabel={`Add ${singular}`}
            onCancel={() => setAdding(false)}
            onSubmit={async (v) => { const r = await saveEntity(entity, null, v); if (r.ok) { setAdding(false); refresh(); } return r; }}
            aside={aside === "weightPreview" ? (v) => <WeightPreview values={v} rows={rows} editingId={null} /> : undefined}
          />
        </div>
      ) : null}

      {rows.length === 0 && !adding ? (
        <p className="text-body text-ash py-3">{emptyState}</p>
      ) : (
        <SortableList
          items={rows}
          onReorder={onReorder}
          className="border-t border-divider-light"
          itemClassName="border-b border-divider-light"
          renderItem={(row, handle) => (
            <div>
              <div className={cx("grid grid-cols-[24px_minmax(0,1fr)_auto] gap-2 items-center py-1 pr-1", editing === row.id && "is-active bg-paper")}>
                <span className="pl-1">{handle}</span>
                <div className="min-w-0">
                  <p className={cx("text-body max-w-none truncate", row.status === "PUBLISHED" ? "text-ink" : "text-ash")}>{row.title}</p>
                  {row.sub ? <p className="text-small text-ash max-w-none truncate">{row.sub}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  {featuredToggle ? (
                    <Toggle size="sm" checked={Boolean(row.featured)} label="Featured" onChange={async (v) => (await toggleEntity(entity, row.id, "featured", v)).ok} />
                  ) : null}
                  <Toggle size="sm" checked={row.status === "PUBLISHED"} label="Published" onChange={async (v) => (await toggleEntity(entity, row.id, "status", v)).ok} />
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(editing === row.id ? null : row.id); setAdding(false); }}>{editing === row.id ? "Close" : "Edit"}</Button>
                  {confirmId === row.id ? (
                    <span className="inline-flex items-center gap-1 text-small">
                      Delete? <Button size="sm" variant="destructive" onClick={() => onDelete(row.id)}>Yes</Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>No</Button>
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(row.id)}>Delete</Button>
                  )}
                </div>
              </div>
              {editing === row.id ? (
                <div className="bg-paper border-t border-divider-light p-3">
                  <EntityForm
                    fields={fields}
                    initial={row.values}
                    idPrefix={row.id}
                    onCancel={() => setEditing(null)}
                    onSubmit={async (v) => { const r = await saveEntity(entity, row.id, v); if (r.ok) { setEditing(null); refresh(); } return r; }}
                    aside={aside === "weightPreview" ? (v) => <WeightPreview values={v} rows={rows} editingId={row.id} /> : undefined}
                  />
                </div>
              ) : null}
            </div>
          )}
        />
      )}
    </div>
  );
}
