"use client";
// Client component: shows the result of the revalidate action in place.

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { revalidateSite } from "@/lib/admin/actions";

export function RevalidateButton({ last }: { last: string | null }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAt, setLastAt] = useState(last);

  return (
    <div className="flex flex-col gap-1 items-start">
      <Button
        size="sm"
        variant="secondary"
        pending={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const r = await revalidateSite();
            if (r.ok && r.data) {
              setLastAt(r.data.at);
              setMessage("Site revalidated.");
            } else if (!r.ok) setError(r.error);
          })
        }
      >
        Revalidate site
      </Button>
      {message ? <p role="status" className="text-small text-ash max-w-none">{message}</p> : null}
      {error ? <p role="alert" className="text-small text-status-error max-w-none">{error}</p> : null}
      <p className="data text-ash max-w-none">{lastAt ? `last ${new Date(lastAt).toISOString().replace("T", " ").slice(0, 16)}` : "not yet run"}</p>
    </div>
  );
}
