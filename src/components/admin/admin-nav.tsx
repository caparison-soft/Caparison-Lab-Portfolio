"use client";
// Client component: the active item needs the current pathname.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

export type AdminNavItem = { href: string; label: string; badge?: number; mobile?: boolean };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="list-none m-0 p-0 flex flex-col">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className={cx(active && "is-active", !item.mobile && "hidden md:block")}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center justify-between gap-2 py-[6px] pl-2 pr-1 text-small font-medium no-underline transition-colors dur-fast rounded-none",
                  active ? "text-ink bg-paper" : "text-ash hover:text-ink",
                )}
              >
                <span>{item.label}</span>
                {item.badge ? <span className="data text-mono-s bg-lime text-ink rounded-sm px-[6px] py-[1px]">{item.badge}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
