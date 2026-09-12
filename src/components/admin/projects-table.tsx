"use client";
// Client component: TanStack table with filters, sorting, selection, bulk
// actions, optimistic featured toggle and drag reordering when unfiltered.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { Button, Input, Select } from "@/components/ui";
import { SortableList } from "@/components/admin/sortable-list";
import { Toggle } from "@/components/admin/toggle";
import { StatusPill } from "@/components/admin/status-pill";
import { reorderProjects, setProjectsStatus, toggleProjectFeatured } from "@/lib/admin/project-actions";
import type { ProjectListRow } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";

type Props = { rows: ProjectListRow[]; categories: { id: string; name: string }[]; initialStatus?: string };

export function ProjectsTable({ rows: initialRows, categories, initialStatus }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  useEffect(() => setRows(initialRows), [initialRows]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [category, setCategory] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(
    () => rows.filter((r) => (!status || r.status === status) && (!category || r.category?.id === category) && (!search || r.title.toLowerCase().includes(search.toLowerCase()))),
    [rows, status, category, search],
  );
  const canReorder = !status && !category && !search && sorting.length === 0;

  const columns = useMemo<ColumnDef<ProjectListRow>[]>(
    () => [
      {
        id: "select",
        header: () => <span className="sr-only">Select</span>,
        cell: ({ row }) => (
          <input type="checkbox" aria-label={`Select ${row.original.title}`} checked={Boolean(selected[row.original.id])} onChange={(e) => setSelected((s) => ({ ...s, [row.original.id]: e.target.checked }))} className="w-2 h-2 accent-[#D6F631]" />
        ),
      },
      {
        id: "cover",
        header: "",
        cell: ({ row }) => (
          <span className="block w-[48px] h-[30px] rounded-sm bg-paper border border-divider-light overflow-hidden">
            {row.original.coverUrl ? <img src={row.original.coverUrl} alt="" width={48} height={30} className="w-full h-full object-cover" /> : null}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link href={`/admin/projects/${row.original.id}`} className="text-body font-medium text-ink no-underline hover:underline">{row.original.title}</Link>
            <p className="data text-ash max-w-none">{row.original.slug}{row.original.currentlyBuilding ? "  building" : ""}</p>
          </div>
        ),
      },
      { id: "category", accessorFn: (r) => r.category?.name ?? "", header: "Type", cell: ({ getValue }) => <span className="text-small text-ash">{String(getValue() ?? "")}</span> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusPill value={String(getValue())} /> },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) => (
          <Toggle size="sm" showLabel={false} label={`Featured: ${row.original.title}`} checked={row.original.featured} onChange={async (v) => (await toggleProjectFeatured(row.original.id, v)).ok} />
        ),
      },
      { accessorKey: "updatedAt", header: "Updated", cell: ({ getValue }) => <span className="data text-ash">{String(getValue()).replace("T", " ").slice(0, 16)}</span> },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <span className="flex gap-1 justify-end">
            <Button size="sm" variant="ghost" href={`/admin/projects/${row.original.id}`}>Edit</Button>
            {row.original.status === "PUBLISHED" ? <Button size="sm" variant="ghost" href={`/work/${row.original.slug}`} target="_blank" rel="noopener">View</Button> : null}
          </span>
        ),
      },
    ],
    [selected],
  );

  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() });

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  function bulk(s: "PUBLISHED" | "DRAFT" | "ARCHIVED") {
    const prev = rows;
    setRows(rows.map((r) => (selectedIds.includes(r.id) ? { ...r, status: s } : r)));
    start(async () => {
      const r = await setProjectsStatus(selectedIds, s);
      if (!r.ok) { setRows(prev); setError(r.error); } else { setSelected({}); router.refresh(); }
    });
  }
  function onReorder(ids: string[]) {
    const prev = rows;
    setRows(ids.map((id) => rows.find((r) => r.id === id)!));
    start(async () => {
      const r = await reorderProjects(ids);
      if (!r.ok) { setRows(prev); setError(r.error); }
    });
  }

  const grid = "grid grid-cols-[24px_28px_56px_minmax(0,1fr)_140px_120px_80px_130px_140px] gap-2 items-center";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-[240px]">
          <label htmlFor="search" className="sr-only">Search by title</label>
          <Input id="search" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[32px] text-small" />
        </div>
        <div className="w-[150px]">
          <label htmlFor="status" className="sr-only">Status</label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-[32px] text-small">
            <option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option>
          </Select>
        </div>
        <div className="w-[180px]">
          <label htmlFor="category" className="sr-only">Type</label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-[32px] text-small">
            <option value="">All types</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        {selectedIds.length > 0 ? (
          <div className="ml-auto flex items-center gap-1">
            <span className="text-small text-ash">{selectedIds.length} selected</span>
            <Button size="sm" onClick={() => bulk("PUBLISHED")} pending={pending}>Publish</Button>
            <Button size="sm" variant="secondary" onClick={() => bulk("DRAFT")} pending={pending}>Unpublish</Button>
            <Button size="sm" variant="secondary" onClick={() => bulk("ARCHIVED")} pending={pending}>Archive</Button>
          </div>
        ) : (
          <p className="ml-auto text-small text-ash max-w-none">{canReorder ? "Drag the handle to reorder." : "Clear filters and sorting to reorder."}</p>
        )}
      </div>
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {table.getHeaderGroups().map((hg) => (
            <div key={hg.id} className={cx(grid, "px-1 pb-1 border-b border-divider-light text-small text-ash")}>
              <span className="sr-only">Reorder</span>
              {hg.headers.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={cx("text-left text-small", h.column.getCanSort() ? "hover:text-ink" : "cursor-default")}
                  onClick={h.column.getToggleSortingHandler()}
                  disabled={!h.column.getCanSort()}
                  aria-sort={h.column.getIsSorted() === "asc" ? "ascending" : h.column.getIsSorted() === "desc" ? "descending" : undefined}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() ? <span className="ml-[4px] data">{h.column.getIsSorted() === "asc" ? "asc" : "desc"}</span> : null}
                </button>
              ))}
            </div>
          ))}
          <SortableList
            items={table.getRowModel().rows.map((r) => ({ id: r.original.id, row: r }))}
            onReorder={onReorder}
            disabled={!canReorder}
            itemClassName="border-b border-divider-light"
            renderItem={(item, handle) => (
              <div className={cx(grid, "px-1 py-1", selected[item.id] && "bg-paper")}>
                {handle}
                {item.row.getVisibleCells().map((cell) => <div key={cell.id} className="min-w-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>)}
              </div>
            )}
          />
          {filtered.length === 0 ? <p className="py-4 text-body text-ash">No projects match. Clear the filters to see everything.</p> : null}
        </div>
      </div>
    </div>
  );
}
