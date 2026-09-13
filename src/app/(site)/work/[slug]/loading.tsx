/** Skeleton matching the case page layout. */
export default function CaseLoading() {
  return (
    <main id="main" aria-busy="true">
      <section className="px-3 md:px-[48px] pt-4 lg:pt-6 pb-6">
        <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
          <aside className="flex flex-col gap-3">
            <div className="h-[16px] w-[48px] bg-paper rounded-sm" />
            {[0, 1, 2, 3].map((i) => <div key={i} className="hidden lg:block h-[36px] w-[120px] bg-paper rounded-sm" />)}
          </aside>
          <div>
            <div className="h-[16px] w-[120px] bg-paper rounded-sm" />
            <div className="mt-2 h-[56px] w-[360px] max-w-full bg-paper rounded-sm" />
            <div className="mt-2 h-[24px] w-[480px] max-w-full bg-paper rounded-sm" />
            <div className="mt-4 w-full aspect-[16/10] bg-paper rounded-lg" />
            <div className="mt-5 max-w-[720px] flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-[16px] bg-paper rounded-sm" style={{ width: `${90 - i * 12}%` }} />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
