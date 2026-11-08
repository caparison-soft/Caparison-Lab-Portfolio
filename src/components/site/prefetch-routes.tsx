"use client";
// Client component: warms the routes a visitor is most likely to open next, as
// soon as the browser is idle after load (owner, 2026-11-07: links deep in the
// home page, like "See how" and the work cards, took about a second because
// Next only prefetches a link once it scrolls into view). Production only;
// the dev server does not prefetch at all.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PrefetchRoutes({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  const key = hrefs.join("|");
  useEffect(() => {
    const list = key.split("|").filter(Boolean).map((h) => h.split("#")[0] || "/");
    const run = () => [...new Set(list)].forEach((h) => router.prefetch(h));
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(run, 1200);
    return () => window.clearTimeout(id);
  }, [key, router]);
  return null;
}
