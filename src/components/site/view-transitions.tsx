"use client";
// Client component: wraps App Router navigation in document.startViewTransition
// so the cover image morphs between the index and the case page. Browsers
// without the API, and people who prefer reduced motion, get a plain navigation.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, startTransition, useCallback, useContext, useEffect, useRef, type ComponentProps, type MouseEvent } from "react";

type Ctx = { navigate: (href: string) => void };
const ViewTransitionContext = createContext<Ctx | null>(null);

export function ViewTransitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const finishRef = useRef<(() => void) | null>(null);

  // The new route has rendered: let the transition take its "after" snapshot.
  useEffect(() => {
    finishRef.current?.();
    finishRef.current = null;
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const supported = typeof document !== "undefined" && typeof document.startViewTransition === "function";
      const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!supported || reduced) {
        router.push(href);
        return;
      }
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finishRef.current = resolve;
            startTransition(() => router.push(href));
          }),
      );
    },
    [router],
  );

  return <ViewTransitionContext.Provider value={{ navigate }}>{children}</ViewTransitionContext.Provider>;
}

type TransitionLinkProps = ComponentProps<typeof Link> & { href: string };

export function TransitionLink({ href, onClick, children, ...rest }: TransitionLinkProps) {
  const ctx = useContext(ViewTransitionContext);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !ctx) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (rest.target && rest.target !== "_self") return;
    e.preventDefault();
    ctx.navigate(href);
  };
  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
