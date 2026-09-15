"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Liquid metal button (owner-supplied design, 2026-09-13), rebuilt on our
 * primitives: a chrome ring rendered by @paper-design/shaders' liquid-metal
 * fragment shader, an olive-950 to ink body, and the label on top.
 *
 * Differences from the pasted component, all deliberate:
 * - Fluid width from the label instead of a fixed 142px, two heights (md, sm).
 * - Renders a Next <Link> when `href` is given; supports type="submit",
 *   disabled and pending, so it can stand in for every public-site button.
 * - Label is bone (the hero's .section-dark a rule made it bone there; the owner
 *   wants every button to match), never #666 (3.9:1 fails AA).
 * - The shader mounts only while the button is near the viewport and is
 *   disposed when it leaves, so a page never holds more WebGL contexts than
 *   it has buttons on screen. Reduced motion freezes the shader at speed 0.
 *   Without WebGL2 a static conic-gradient ring in bone/sage stands in.
 * - Focus stays visible (global :focus-visible outline); the original set outline: none.
 */

type Size = "md" | "sm";

type Common = {
  size?: Size;
  /** Disabled with aria-busy. Label stays the same; the action name never changes mid-flow. */
  pending?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & Omit<ComponentPropsWithoutRef<"button">, keyof Common | "href"> & { href?: undefined };
type AsLink = Common & Omit<ComponentPropsWithoutRef<typeof Link>, keyof Common> & { href: string };

export type LiquidMetalButtonProps = AsButton | AsLink;

const SPEED_IDLE = 0.6;
const SPEED_HOVER = 1;
const SPEED_CLICK = 2.4;

type Mount = { setSpeed: (s?: number) => void; dispose: () => void };

const heights: Record<Size, string> = {
  md: "h-[46px] px-[22px] text-body",
  sm: "h-[40px] px-[18px] text-small",
};

let webgl2: boolean | null = null;
function hasWebGL2() {
  if (webgl2 !== null) return webgl2;
  try {
    const c = document.createElement("canvas");
    webgl2 = !!c.getContext("webgl2");
  } catch {
    webgl2 = false;
  }
  return webgl2;
}

export function LiquidMetalButton(props: LiquidMetalButtonProps) {
  const { size = "md", pending = false, className, children, ...rest } = props;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const mount = useRef<Mount | null>(null);
  const hoveredRef = useRef(false);
  const rippleId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const host = shaderRef.current;
    if (!root || !host) return;
    if (!hasWebGL2()) {
      setFallback(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;

    const create = async () => {
      if (cancelled || mount.current) return;
      try {
        const { ShaderMount, liquidMetalFragmentShader } = await import("@paper-design/shaders");
        if (cancelled || mount.current || !shaderRef.current) return;
        mount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            // Density of the chrome stripes. Raised with u_scale so the pattern
            // keeps its grain while the shape covers the whole pill.
            u_repetition: 8,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            // u_shape 1 is a circle, and the shader leaves everything outside it
            // transparent. At the old scale of 8 that circle stopped about 60%
            // across a wide button, so the right end of the ring had no chrome
            // (owner, 2026-09-15). Zooming further in puts the whole pill,
            // however wide, inside the shape.
            u_scale: 40,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          reduced.matches ? 0 : hoveredRef.current ? SPEED_HOVER : SPEED_IDLE,
        ) as unknown as Mount;
      } catch {
        setFallback(true);
      }
    };
    const destroy = () => {
      mount.current?.dispose();
      mount.current = null;
    };

    // Mount only near the viewport; drop the context when the button leaves.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void create();
        else destroy();
      },
      { rootMargin: "160px" },
    );
    io.observe(root);

    const onMotion = () => mount.current?.setSpeed(reduced.matches ? 0 : hoveredRef.current ? SPEED_HOVER : SPEED_IDLE);
    reduced.addEventListener("change", onMotion);

    const pending = timers.current;
    return () => {
      cancelled = true;
      io.disconnect();
      reduced.removeEventListener("change", onMotion);
      pending.forEach((t) => window.clearTimeout(t));
      destroy();
    };
  }, []);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const restSpeed = () => (reducedMotion() ? 0 : hoveredRef.current ? SPEED_HOVER : SPEED_IDLE);

  const onEnter = () => {
    hoveredRef.current = true;
    setHovered(true);
    if (!reducedMotion()) mount.current?.setSpeed(SPEED_HOVER);
  };
  const onLeave = () => {
    hoveredRef.current = false;
    setHovered(false);
    setPressed(false);
    mount.current?.setSpeed(restSpeed());
  };
  const onClickVisual = (e: MouseEvent<HTMLElement>) => {
    if (reducedMotion()) return;
    mount.current?.setSpeed(SPEED_CLICK);
    timers.current.push(window.setTimeout(() => mount.current?.setSpeed(restSpeed()), 300));
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
    setRipples((prev) => [...prev, ripple]);
    timers.current.push(window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600));
  };

  const disabled = pending || ("disabled" in rest && !!rest.disabled);
  const isLink = "href" in rest && typeof rest.href === "string";

  const interactive = cx(
    "liquid-metal-hit relative z-40 inline-flex items-center justify-center gap-1 whitespace-nowrap select-none no-underline font-medium leading-none overflow-hidden",
    heights[size],
    "text-bone",
  );
  const rippleNodes = ripples.map((r) => <span key={r.id} className="liquid-metal-ripple" style={{ left: r.x, top: r.y }} aria-hidden="true" />);

  const shared = {
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onBlur: () => setPressed(false),
  };

  return (
    <span
      ref={rootRef}
      className={cx("liquid-metal inline-block relative align-middle", disabled && "opacity-50 pointer-events-none", className)}
      data-pressed={pressed || undefined}
      data-hovered={hovered || undefined}
    >
      {/* Chrome ring: the shader canvas, or a static gradient without WebGL2. */}
      <span className={cx("liquid-metal-ring", fallback && "liquid-metal-ring-static")} aria-hidden="true">
        <span ref={shaderRef} className="liquid-metal-shader" />
      </span>
      {/* Body */}
      <span className="liquid-metal-body" aria-hidden="true" />
      {isLink ? (
        (() => {
          const { href, onClick, ...linkRest } = rest as Omit<AsLink, keyof Common>;
          return (
            <Link
              href={href}
              className={interactive}
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : undefined}
              onClick={(e) => { onClickVisual(e); onClick?.(e); }}
              {...shared}
              {...linkRest}
            >
              <span className="liquid-metal-label">{children}</span>
              {rippleNodes}
            </Link>
          );
        })()
      ) : (
        (() => {
          const { onClick, type, ...buttonRest } = rest as Omit<AsButton, keyof Common>;
          return (
            <button
              type={type ?? "button"}
              className={interactive}
              aria-busy={pending || undefined}
              disabled={disabled}
              onClick={(e) => { onClickVisual(e); onClick?.(e); }}
              {...shared}
              {...buttonRest}
            >
              <span className="liquid-metal-label">{children}</span>
              {rippleNodes}
            </button>
          );
        })()
      )}
    </span>
  );
}
