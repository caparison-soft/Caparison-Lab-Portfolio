"use client";
// Client component: the case page's story panel (owner-supplied spatial
// showcase, 2026-09-16, rebuilt on our stack). A picture on one side, the
// brief on the other, and "what we built" folded into a panel that opens on
// click. Which side the picture sits on is a project field, not something the
// visitor toggles. Rebuilt rather than pasted: motion instead of
// framer-motion, inline SVG instead of lucide, our tokens instead of the
// blue and emerald in the original.

import { useId, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { RichText } from "@/components/site/rich-text";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = {
  brief: unknown;
  whatWeBuilt: unknown;
  image: MediaItem | null;
  side: "LEFT" | "RIGHT";
  labels: { brief: string; whatWeBuilt: string };
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx("shrink-0 transition-transform dur-base ease-out", open && "rotate-90")}
    >
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The picture, lifted off the page: a neutral bloom behind it (the lime tinted
 * whatever was uploaded, owner 2026-09-16), a slow dashed ring, a constant
 * float, and a tilt toward the pointer so it reads as an object rather than a
 * flat cut-out. A transparent PNG reads best; anything else still sits on the
 * page rather than in a frame.
 */
function StoryImage({ image, reduced }: { image: MediaItem | null; reduced: boolean }) {
  // 0..1 across the box; 0.5/0.5 is flat, and the pointer leaving springs back.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 150, damping: 20 });
  const sy = useSpring(py, { stiffness: 150, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-14, 14]);
  const rotateX = useTransform(sy, [0, 1], [12, -12]);
  // The bloom drifts with the tilt, so the light looks like it has a source.
  const bloomX = useTransform(sx, [0, 1], ["58%", "42%"]);
  const bloomY = useTransform(sy, [0, 1], ["58%", "42%"]);
  const bloom = useMotionTemplate`radial-gradient(circle at ${bloomX} ${bloomY}, rgb(236 238 232 / 0.16), transparent 62%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-square" style={{ perspective: 1000 }}>
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
      {/* The bloom is plain light, not a colour: it has to sit under any logo. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-[4%] rounded-full blur-[56px]"
        style={reduced ? { background: "radial-gradient(circle at 50% 50%, rgb(236 238 232 / 0.14), transparent 62%)" } : { background: bloom }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-dashed border-divider-light"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[6%] flex items-center justify-center"
        style={reduced ? undefined : { transform: "translateZ(48px)" }}
        animate={reduced ? undefined : { y: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {image ? (
          <img
            {...imageSrcSet(image.keyPrefix, image.variants)}
            sizes="(min-width: 1024px) 420px, 80vw"
            alt={image.alt ?? ""}
            width={image.width ?? 1}
            height={image.height ?? 1}
            decoding="async"
            draggable={false}
            className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgb(0_0_0/0.55)]"
          />
        ) : (
          // No picture uploaded yet: the brand's own 3D mark stands in, so the
          // panel has its two columns from the start and the shape of the
          // section is obvious in the admin preview.
          <img
            src="/brand/logo-3d-1280.webp"
            srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w"
            sizes="(min-width: 1024px) 420px, 80vw"
            alt=""
            width={1280}
            height={1302}
            decoding="async"
            draggable={false}
            className="w-[70%] h-[70%] object-contain opacity-70 drop-shadow-[0_30px_60px_rgb(0_0_0/0.55)]"
          />
        )}
      </motion.div>
      </motion.div>
    </div>
  );
}

export function CaseStory({ brief, whatWeBuilt, image, side, labels }: Props) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const panelId = useId();
  const hasBuilt = Boolean(whatWeBuilt);
  const rise = reduced ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } };

  return (
    <section className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center" aria-labelledby={`${panelId}-brief`}>
      <motion.div
        {...rise}
        transition={{ duration: 0.7, ease: EASE }}
        // The picture is second in the DOM so the text leads on a phone; the
        // admin's choice only moves it at lg, where there are two columns.
        className={cx("order-2", side === "LEFT" ? "lg:order-1" : "lg:order-2")}
      >
        <StoryImage image={image} reduced={reduced} />
      </motion.div>

      <motion.div
        {...rise}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className={cx("order-1 min-w-0", side === "LEFT" ? "lg:order-2" : "lg:order-1")}
      >
        <h2 id={`${panelId}-brief`} className="text-h2 text-ink">{labels.brief}</h2>
        <div className="mt-3 text-body text-ash [&_p]:text-ash [&_p]:max-w-[60ch]">
          <RichText content={brief} />
        </div>

        {hasBuilt ? (
          <div className="mt-4 rounded-lg border border-divider-light bg-paper/60 backdrop-blur-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-h4 font-medium text-ink hover:bg-paper transition-colors dur-fast"
            >
              <span>{labels.whatWeBuilt}</span>
              <Chevron open={open} />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  key="panel"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 text-body text-ash [&_p]:text-ash [&_li]:text-ash [&_p]:max-w-[60ch] [&_ul]:max-w-[60ch]">
                    <RichText content={whatWeBuilt} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
