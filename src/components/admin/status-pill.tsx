import { StatusDot, type Status } from "@/components/ui";

const map: Record<string, { status: Status; label: string }> = {
  PUBLISHED: { status: "live", label: "Published" },
  DRAFT: { status: "draft", label: "Draft" },
  ARCHIVED: { status: "warn", label: "Archived" },
};

export function StatusPill({ value }: { value: string }) {
  const m = map[value] ?? { status: "info" as Status, label: value };
  return <StatusDot status={m.status} label={m.label} />;
}
