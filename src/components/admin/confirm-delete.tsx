"use client";
// Client component: typed confirmation for destructive actions on projects.

import { useRef, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";

type ConfirmDeleteProps = {
  label: string;
  /** What must be typed back, e.g. the project title. */
  expected: string;
  onConfirm: (typed: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  description?: string;
};

export function ConfirmDelete({ label, expected, onConfirm, description }: ConfirmDeleteProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const confirm = () => start(async () => { const r = await onConfirm(typed); if (r.ok) ref.current?.close(); else setError(r.error); });

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => { setTyped(""); setError(null); ref.current?.showModal(); }}>{label}</Button>
      <dialog ref={ref} className="m-auto w-[min(92vw,440px)] rounded-lg border border-divider-light bg-paper p-4 backdrop:bg-olive-950/60 text-ink">
        {/* Not a <form>: this dialog can sit inside an editor form, and forms must not nest. */}
        <div className="flex flex-col gap-3" onKeyDown={(e) => { if (e.key === "Enter" && typed.trim() === expected.trim()) { e.preventDefault(); confirm(); } }}>
          <p className="text-h4 font-medium max-w-none">{label}</p>
          <p className="text-small text-ash max-w-none">{description ?? "This cannot be undone from the admin panel."} Type <span className="font-medium text-ink">{expected}</span> to confirm.</p>
          <Field id="confirm-typed" label="Type the title">
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </Field>
          {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => ref.current?.close()}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={typed.trim() !== expected.trim()} pending={pending} onClick={confirm}>{label}</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
