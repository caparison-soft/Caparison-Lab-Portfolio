import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Surface } from "./types";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "md" | "sm";

type Common = {
  variant?: Variant;
  surface?: Surface;
  size?: Size;
  /** Disabled with aria-busy. Label stays the same; the action name never changes mid-flow. */
  pending?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & Omit<ComponentPropsWithoutRef<"button">, keyof Common | "href"> & { href?: undefined };
type AsLink = Common & Omit<ComponentPropsWithoutRef<typeof Link>, keyof Common> & { href: string };

export type ButtonProps = AsButton | AsLink;

const base =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm font-medium leading-none select-none no-underline " +
  "transition-colors dur-fast ease-out " +
  "disabled:opacity-50 disabled:pointer-events-none aria-busy:opacity-70 aria-busy:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "h-[40px] px-3 text-body",
  sm: "h-[32px] px-2 text-small",
};

const variants: Record<Surface, Record<Variant, string>> = {
  light: {
    primary: "bg-lime text-ink hover:bg-olive-400",
    secondary: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-bone",
    ghost: "bg-transparent text-ash hover:text-ink px-2",
    destructive: "bg-status-error text-white hover:bg-status-error-hover",
  },
  dark: {
    primary: "bg-lime text-ink hover:bg-olive-400",
    secondary: "bg-transparent text-bone border border-olive-600 hover:bg-olive-800 hover:border-lime",
    ghost: "bg-transparent text-sage hover:text-lime px-2",
    destructive: "bg-status-error text-white hover:bg-status-error-hover",
  },
};

/**
 * Button. Renders a <button>, or a Next <Link> when `href` is given.
 * Primary is the only lime fill on a light surface, always with ink on top.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", surface = "light", size = "md", pending = false, className, children, ...rest } = props;
  const classes = cx(base, sizes[size], variants[surface][variant], variant === "primary" && "btn-primary", surface === "dark" && "on-dark", className);

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkRest } = rest as Omit<AsLink, keyof Common>;
    return (
      <Link href={href} className={classes} aria-disabled={pending || undefined} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as Omit<AsButton, keyof Common>;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={classes}
      aria-busy={pending || undefined}
      disabled={buttonRest.disabled || pending}
      {...buttonRest}
    >
      {children}
    </button>
  );
}
