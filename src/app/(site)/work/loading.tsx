import { Section, Spine } from "@/components/ui";

/** Skeleton matching the work index layout so nothing shifts when data lands. */
export default function WorkLoading() {
  return (
    <main id="main" aria-busy="true">
      <Section pad="tall" className="pb-4">
        <Spine sticky={false} rail={<div className="h-[16px] w-[64px] bg-paper rounded-sm" />}>
          <div className="h-[60px] w-[200px] bg-paper rounded-sm" />
          <div className="mt-3 h-[24px] w-[520px] max-w-full bg-paper rounded-sm" />
        </Spine>
      </Section>
      <Section pad="none" className="pb-6">
        <Spine sticky={false} rail={<div className="flex flex-col gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[32px] w-[120px] bg-paper rounded-full" />)}</div>}>
          <ol className="list-none m-0 p-0 border-t border-divider-light">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="border-b border-divider-light px-2 py-2">
                <div className="h-[22px] w-[240px] bg-paper rounded-sm" />
                <div className="mt-2 h-[16px] w-[420px] max-w-full bg-paper rounded-sm" />
                <div className="mt-2 flex gap-1">{[0, 1, 2].map((j) => <div key={j} className="h-[24px] w-[64px] bg-paper rounded-sm" />)}</div>
              </li>
            ))}
          </ol>
        </Spine>
      </Section>
    </main>
  );
}
