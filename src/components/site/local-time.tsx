"use client";
// Client component: the studio's local time, ticking once a minute. Rendered
// empty on the server so the markup never disagrees with the browser clock.

import { useEffect, useState } from "react";

export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    let fmt: Intl.DateTimeFormat;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    } catch {
      // A mistyped zone in the admin should not take the footer down.
      return;
    }
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return <time className={className}>{now ?? "--:--"}</time>;
}
