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

function Chevron({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cx("shrink-0", className)}>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
 * The picture, lifted off the page: a neutral bloom behind it and a constant
 * float, and nothing else. The lime bloom, the pointer tilt and the dashed
 * ring around it were each tried and dropped (owner, 2026-09-16). A
 * transparent PNG reads best; anything else still sits on the page rather
 * than in a frame.
 */
function StoryImage({ image, reduced }: { image: MediaItem | null; reduced: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-square">
      {/* The bloom is plain light, not a colour: it has to sit under any logo. */}
      <div
        aria-hidden="true"
        className="absolute inset-[4%] rounded-full blur-[56px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgb(236 238 232 / 0.14), transparent 62%)" }}
      />
      <motion.div
        className="absolute inset-[6%] flex items-center justify-center"
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
    <section className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center" aria-labelledby={`${panelId}-brief`}>
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
        <h2 id={`${panelId}-brief`} className="text-h2 text-ink">{labels.brief}</h2>
        <div className="mt-3 text-body text-ash [&_p]:text-ash [&_p]:max-w-[60ch]">
          <RichText content={brief} />
        </div>

        {hasBuilt ? (
          <>
            {/* Lime text, no shape (owner, 2026-09-16). Lime as text is only
                allowed because the story panel sits on the matte ground. */}
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              // Stays lime on hover: bone is remapped to the matte grey inside
              // .site-ground, so hovering made it vanish (owner, 2026-09-16).
              className="story-open mt-4 inline-flex items-center gap-1 text-h4 font-medium text-lime underline-offset-4 hover:underline"
            >
              <span>{labels.whatWeBuilt}</span>
              <Chevron />
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
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10">
                <h3 id={`${panelId}-title`} className="text-h4 font-medium text-ink m-0">{labels.whatWeBuilt}</h3>
                <button
                  type="button"
                  onClick={() => ref.current?.close()}
                  aria-label={labels.close}
                  className="inline-flex items-center justify-center h-[32px] w-[32px] rounded-full text-ash hover:text-ink hover:bg-white/10 transition-colors dur-fast"
                >
                  <Close />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(82svh-52px)] px-3 py-3 text-body text-ash [&_p]:text-ash [&_li]:text-ash [&_p]:max-w-[68ch] [&_ul]:max-w-[68ch]">
                <RichText content={whatWeBuilt} />
              </div>
            </dialog>
          </>
        ) : null}
      </motion.div>
    </section>
  );
}
