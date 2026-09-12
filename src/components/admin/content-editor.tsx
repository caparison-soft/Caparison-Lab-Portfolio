"use client";
// Client component: one form per group, dirty tracking, reset-to-default per block.

import { useState, useTransition } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { saveContentGroup } from "@/lib/admin/entity-actions";
import type { ContentGroup } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";

function GroupForm({ group }: { group: ContentGroup }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(group.blocks.map((b) => [b.key, b.value])));
  const [saved, setSaved] = useState<Record<string, string>>(values);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const changed = group.blocks.filter((b) => values[b.key] !== saved[b.key]).map((b) => b.key);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    start(async () => {
      const r = await saveContentGroup(group.group, changed.map((key) => ({ key, value: values[key] })));
      if (r.ok) { setSaved({ ...values }); setStatus(`Saved ${changed.length} ${changed.length === 1 ? "change" : "changes"}.`); }
      else setError(r.error);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-3">
      {group.blocks.map((b) => {
        const id = `cb-${b.key}`;
        const multiline = b.type === "RICHTEXT" || b.value.includes("\n") || b.defaultValue.includes("\n") || b.value.length > 80;
        const isChanged = values[b.key] !== saved[b.key];
        const isDefault = values[b.key] === b.defaultValue;
        const help = b.helpText ?? undefined;
        return (
          <div key={b.key} title={b.key} className={cx("grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2 items-start pl-2 -ml-2", isChanged && "is-active")}>
            <Field id={id} label={b.label} help={help}>
              {multiline ? (
                <Textarea value={values[b.key]} onChange={(e) => setValues({ ...values, [b.key]: e.target.value })} rows={Math.min(8, Math.max(2, values[b.key].split("\n").length + 1))} />
              ) : (
                <Input type={b.type === "URL" || b.type === "IMAGE" ? "url" : b.type === "NUMBER" ? "number" : "text"} value={values[b.key]} onChange={(e) => setValues({ ...values, [b.key]: e.target.value })} />
              )}
            </Field>
            <div className="md:pt-[26px]">
              <Button type="button" size="sm" variant="ghost" disabled={isDefault} onClick={() => setValues({ ...values, [b.key]: b.defaultValue })} title={isDefault ? "Already the default" : `Default: ${b.defaultValue.slice(0, 60)}`}>
                Reset
              </Button>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 border-t border-divider-light pt-3">
        <Button type="submit" size="sm" disabled={changed.length === 0} pending={pending}>Save {group.group.toLowerCase()}</Button>
        {changed.length > 0 ? <span className="text-small text-ash">{changed.length} unsaved</span> : null}
        {status ? <span role="status" className="text-small text-ash">{status}</span> : null}
        {error ? <span role="alert" className="text-small text-status-error">{error}</span> : null}
      </div>
    </form>
  );
}

export function ContentEditor({ groups }: { groups: ContentGroup[] }) {
  const [open, setOpen] = useState<string>(groups[0]?.group ?? "");
  return (
    <div className="border-t border-divider-light">
      {groups.map((g) => {
        const isOpen = open === g.group;
        return (
          <section key={g.group} className="border-b border-divider-light">
            <h2 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`group-${g.group}`}
                onClick={() => setOpen(isOpen ? "" : g.group)}
                className={cx("w-full flex items-center justify-between gap-2 py-2 pl-2 text-left text-h4 font-medium transition-colors dur-fast", isOpen ? "is-active bg-paper text-ink" : "text-ink hover:bg-paper")}
              >
                <span>{g.group}</span>
                <span className="data text-ash pr-2">{g.blocks.length}</span>
              </button>
            </h2>
            <div id={`group-${g.group}`} hidden={!isOpen}>
              {isOpen ? <GroupForm group={g} /> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
