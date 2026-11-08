"use client";
// Client component: the case page's story panel (owner-supplied spatial
// showcase, 2026-09-16, rebuilt on our stack). A picture on one side, the
// brief on the other, and "what we built" folded into a panel that opens on
// click. Which side the picture sits on is a project field, not something the
// visitor toggles. Rebuilt rather than pasted: motion instead of
// framer-motion, inline SVG instead of lucide, our tokens instead of the
// blue and emerald in the original.

import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { RichText } from "@/components/site/rich-text";
import type { MediaItem } from "@/lib/queries/work";
import { imageSrcSet } from "@/lib/media";
import { cx } from "@/lib/cx";

type Props = {
  brief: unknown;
  whatWeBuilt: unknown;
  image: MediaItem | null;
  side: "LEFT" | "RIGHT";
  labels: { brief: string; whatWeBuilt: string; close: string };
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Close() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The picture on a dark stage (light redesign, 2026-11-05): a transparent
 * logo or product shot reads on olive-950, and the light page gets one deep
 * surface beside the text. It floats gently; reduced motion holds it still.
 * The lime bloom, the pointer tilt and the dashed ring were each tried and
 * dropped (owner, 2026-09-16).
 */
function StoryImage({ image, reduced }: { image: MediaItem | null; reduced: boolean }) {
  return (
    <div className="wk-story-stage">
      <motion.div
        className="absolute inset-[12%] flex items-center justify-center"
        animate={reduced ? undefined : { y: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {image ? (
          <img
            {...imageSrcSet(image.keyPrefix, image.variants)}
            sizes="(min-width: 1024px) 400px, 76vw"
            alt={image.alt ?? ""}
            width={image.width ?? 1}
            height={image.height ?? 1}
            decoding="async"
            draggable={false}
            className="w-full h-full object-contain"
          />
        ) : (
          // No picture uploaded yet: the brand's own 3D mark stands in, so the
          // panel has its two columns from the start.
          <img
            src="/brand/logo-3d-1280.webp"
            srcSet="/brand/logo-3d-640.webp 640w, /brand/logo-3d-1280.webp 1280w"
            sizes="(min-width: 1024px) 400px, 76vw"
            alt=""
            width={1280}
            height={1302}
            decoding="async"
            draggable={false}
            className="w-[80%] h-[80%] object-contain"
          />
        )}
      </motion.div>
    </div>
  );
}

export function CaseStory({ brief, whatWeBuilt, image, side, labels }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion() ?? false;
  const panelId = useId();
  // showModal() makes the page inert but does not stop it scrolling behind the
  // dialog, so the lock is ours; the close event covers Escape too.
  const open = () => { ref.current?.showModal(); document.documentElement.style.overflow = "hidden"; };
  const onClose = () => { document.documentElement.style.overflow = ""; };
  useEffect(() => () => { document.documentElement.style.overflow = ""; }, []);
  const hasBuilt = Boolean(whatWeBuilt);
  const rise = reduced ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center" aria-labelledby={`${panelId}-brief`}>
      <motion.div
        {...rise}
        transition={{ duration: 0.7, ease: EASE }}
        // The picture is second in the DOM so the text leads on a phone; the
        // admin's choice only moves it at lg, where there are two columns.
        className={cx("story-picture order-2", side === "LEFT" ? "lg:order-1" : "lg:order-2")}
      >
        <StoryImage image={image} reduced={reduced} />
      </motion.div>

      <motion.div
        {...rise}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className={cx("order-1 min-w-0", side === "LEFT" ? "lg:order-2" : "lg:order-1")}
      >
        <h2 id={`${panelId}-brief`} className="text-display-l text-ink">{labels.brief}</h2>
        <div className="mt-3 text-body-l text-ash [&_p]:text-ash [&_p]:text-body-l [&_p]:max-w-[60ch]">
          <RichText content={brief} />
        </div>

        {hasBuilt ? (
          <>
            {/* On the light page the trigger is an ink button (lime is never text
                on light); it opens the detail in a native dialog. */}
            <button type="button" onClick={open} aria-haspopup="dialog" className="cl-btn cl-btn--ink cl-btn--sm mt-4">
              <span>{labels.whatWeBuilt}</span>
              <span className="cl-btn-puck" aria-hidden="true"><Arrow /><Arrow /></span>
            </button>

            {/* A native dialog: the top layer beats the grain and the header, and
                Escape, focus trapping and inertness come with it. */}
            <dialog
              ref={ref}
              aria-labelledby={`${panelId}-title`}
              onClose={onClose}
              onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
              className="story-modal m-auto w-[min(92vw,720px)] max-h-[82svh] rounded-lg text-ink p-0 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-divider-light">
                <h3 id={`${panelId}-title`} className="text-h3 text-ink m-0">{labels.whatWeBuilt}</h3>
                <button
                  type="button"
                  onClick={() => ref.current?.close()}
                  aria-label={labels.close}
                  className="inline-flex items-center justify-center h-[40px] w-[40px] rounded-full border border-divider-light text-ink hover:bg-bone transition-colors dur-fast"
                >
                  <Close />
                </button>
              </div>
              <div data-lenis-prevent className="overflow-y-auto max-h-[calc(82svh-60px)] px-3 py-3 text-body text-ash [&_p]:text-ash [&_li]:text-ash [&_p]:max-w-[68ch] [&_ul]:max-w-[68ch]">
                <RichText content={whatWeBuilt} />
              </div>
            </dialog>
          </>
        ) : null}
      </motion.div>
    </section>
  );
}
