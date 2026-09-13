"use client";
// Client component: error boundaries must be. This is the one place with
// fixed copy on the public site, because it renders when the database that
// holds the copy may be the thing that failed.

import { useEffect } from "react";
import { Button, Section } from "@/components/ui";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main">
      <Section pad="tall" innerClassName="min-h-[60svh] flex flex-col items-start justify-center">
        <p className="data text-ash">error{error.digest ? ` ${error.digest}` : ""}</p>
        <h1 className="mt-2 text-display-l">Something didn&rsquo;t load.</h1>
        <p className="mt-3 text-body-l text-ash max-w-[44ch]">Try again in a moment. If it keeps happening, email hello@caparisonlab.com and mention the code above.</p>
        <div className="mt-4"><Button onClick={reset}>Try again</Button></div>
      </Section>
    </main>
  );
}
