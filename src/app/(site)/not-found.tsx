import { Button, Section } from "@/components/ui";
import { getBlocks, t } from "@/lib/queries/content";

/** The one centred layout on the site: a deliberate pause. */
export default async function NotFound() {
  const blocks = await getBlocks(["Errors"]);
  return (
    <main id="main">
      <Section pad="tall" innerClassName="min-h-[60svh] flex flex-col items-center justify-center text-center">
        <p className="data text-ash">404</p>
        <h1 className="mt-2 text-display-l">{t(blocks, "notFound.heading")}</h1>
        <p className="mt-3 text-body-l text-ash">{t(blocks, "notFound.body")}</p>
        <div className="mt-4">
          <Button href="/work">{t(blocks, "notFound.ctaLabel")}</Button>
        </div>
      </Section>
    </main>
  );
}
