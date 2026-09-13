"use client";
// Client component: error boundary for the admin panel.

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="max-w-[640px] flex flex-col gap-3">
      <p className="data text-ash">error{error.digest ? ` ${error.digest}` : ""}</p>
      <h1 className="text-h2">That didn&rsquo;t work.</h1>
      <p className="text-body text-ash">{error.message || "Something failed on the server."} Your last save is safe; unsaved edits on this screen may be lost.</p>
      <div className="flex gap-2"><Button size="sm" onClick={reset}>Try again</Button><Button size="sm" variant="ghost" href="/admin">Back to the dashboard</Button></div>
    </div>
  );
}
