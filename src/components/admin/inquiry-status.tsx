"use client";
// Client component: optimistic status change with rollback and a visible error.

import { useOptimistic, useState, useTransition } from "react";
import { Select } from "@/components/ui";
import { updateInquiryStatus, type InquiryStatus } from "@/lib/admin/actions";

const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "REPLIED", label: "Replied" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export function InquiryStatusSelect({ id, status, label, onChanged }: { id: string; status: InquiryStatus; label: string; onChanged?: (s: InquiryStatus) => void }) {
  const [current, setCurrent] = useState<InquiryStatus>(status);
  const [optimistic, setOptimistic] = useOptimistic(current);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: InquiryStatus) {
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await updateInquiryStatus(id, next);
      if (result.ok) { setCurrent(next); onChanged?.(next); }
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-[4px]">
      <label htmlFor={`status-${id}`} className="sr-only">{label}</label>
      <Select id={`status-${id}`} value={optimistic} disabled={pending} onChange={(e) => onChange(e.target.value as InquiryStatus)} className="h-[32px] text-small">
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}
    </div>
  );
}
