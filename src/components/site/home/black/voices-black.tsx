import type { Blocks } from "@/lib/queries/content";
import { t } from "@/lib/queries/content";
import { Split, vars } from "@/components/motion/split";
import { VoiceCard, type Voice } from "./voice-card";

/**
 * Home on black: video testimonials (owner, 2026-11-07), after the logo
 * strip. The first is a landscape film and gets a wide card, video beside
 * the quote; the rest are vertical reels, four across. Server component.
 */
export function VoicesBlack({ blocks }: { blocks: Blocks }) {
  const play = t(blocks, "home.voices.play");
  const voices: Voice[] = [1, 2, 3, 4, 5]
    .map((i) => {
      const name = t(blocks, `home.voices.t${i}.name`);
      return {
        name,
        role: t(blocks, `home.voices.t${i}.role`),
        video: t(blocks, `home.voices.t${i}.video`),
        poster: t(blocks, `home.voices.t${i}.poster`),
        quote: t(blocks, `home.voices.t${i}.quote`),
        playLabel: play.replace("{name}", name),
      };
    })
    .filter((v) => v.quote && !v.quote.startsWith("home.voices."));
  if (voices.length === 0) return null;
  const [lead, ...rest] = voices;
  return (
    <section className="px-3 md:px-[48px] py-5 lg:py-[72px]" aria-labelledby="hb-voices-heading">
      <div className="max-w-layout mx-auto">
        <div className="text-center">
          <Split as="h2" id="hb-voices-heading" text={t(blocks, "home.voices.heading")} className="hb-h2 mx-auto max-w-[18ch]" />
          <p className="hb-sub mt-2 text-body max-w-[52ch] mx-auto" data-reveal="up">{t(blocks, "home.voices.sub")}</p>
        </div>
        <div className="mt-5" data-reveal="up">
          <VoiceCard v={lead} wide />
        </div>
        {rest.length ? (
          <div className="vo-grid">
            {rest.map((v, i) => (
              <div key={v.name} data-reveal="up" style={vars({ "--d": i * 90 })}>
                <VoiceCard v={v} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
