"use client";
// Client component: multi-select tags grouped by kind, with inline create.

import { useState, useTransition } from "react";
import { Button, Input, Select } from "@/components/ui";
import { createTag } from "@/lib/admin/project-actions";
import { cx } from "@/lib/cx";

type Tag = { id: string; name: string; kind: "STACK" | "INDUSTRY" | "SERVICE" };

export function TagPicker({ tags: initial, value, onChange }: { tags: Tag[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [tags, setTags] = useState(initial);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Tag["kind"]>("STACK");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const kinds: Tag["kind"][] = ["STACK", "INDUSTRY", "SERVICE"];
  const labels = { STACK: "Stack", INDUSTRY: "Industry", SERVICE: "Service" };

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  function add() {
    if (!name.trim()) return;
    start(async () => {
      const r = await createTag(name.trim(), kind);
      if (!r.ok) { setError(r.error); return; }
      const t = r.tag as Tag;
      if (!tags.some((x) => x.id === t.id)) setTags([...tags, t]);
      if (!value.includes(t.id)) onChange([...value, t.id]);
      setName("");
      setError(null);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {kinds.map((k) => (
        <div key={k}>
          <p className="text-small text-ash max-w-none mb-1">{labels[k]}</p>
          <ul className="flex flex-wrap gap-1 list-none m-0 p-0">
            {tags.filter((t) => t.kind === k).map((t) => {
              const on = value.includes(t.id);
              return (
                <li key={t.id}>
                  <button type="button" aria-pressed={on} onClick={() => toggle(t.id)} className={cx("data h-[28px] px-1 rounded-sm border transition-colors dur-fast", on ? "bg-lime text-ink border-lime" : "bg-paper text-ink border-divider-light hover:border-ink")}>
                    {t.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-1">
        <div className="w-[200px]">
          <label htmlFor="new-tag" className="sr-only">New tag name</label>
          <Input id="new-tag" value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag" className="h-[32px] text-small" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        </div>
        <div className="w-[120px]">
          <label htmlFor="new-tag-kind" className="sr-only">Kind</label>
          <Select id="new-tag-kind" value={kind} onChange={(e) => setKind(e.target.value as Tag["kind"])} className="h-[32px] text-small">
            {kinds.map((k) => <option key={k} value={k}>{labels[k]}</option>)}
          </Select>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={add} pending={pending}>Add tag</Button>
        {error ? <span role="alert" className="text-small text-status-error">{error}</span> : null}
      </div>
    </div>
  );
}
