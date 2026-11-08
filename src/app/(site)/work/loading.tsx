/** Skeleton matching the work index layout so nothing shifts when data lands. */
export default function WorkLoading() {
  return (
    <main id="main" aria-busy="true" className="theme-dark">
      <section className="wk-top px-3 md:px-[48px] pb-5">
        <div className="max-w-layout mx-auto">
          <div className="h-[20px] w-[80px] bg-paper rounded-sm" />
          <div className="mt-2 h-[120px] w-[640px] max-w-full bg-paper rounded-lg" />
          <div className="mt-3 h-[24px] w-[520px] max-w-full bg-paper rounded-sm" />
        </div>
      </section>
      <section className="px-3 md:px-[48px] pb-6">
        <div className="max-w-layout mx-auto">
          <div className="flex flex-wrap gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[44px] w-[132px] bg-paper rounded-full" />)}</div>
          <ul className="wk-grid mt-5">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>
                <div className="aspect-[4/3] bg-paper rounded-lg border border-divider-light" />
                <div className="mt-3 h-[32px] w-[240px] bg-paper rounded-sm" />
                <div className="mt-2 h-[16px] w-[420px] max-w-full bg-paper rounded-sm" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
