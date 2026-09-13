/** Generic public skeleton: a heading block in the spine layout. */
export default function SiteLoading() {
  return (
    <main id="main" aria-busy="true">
      <section className="px-3 md:px-[48px] py-6">
        <div className="max-w-layout mx-auto grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3 lg:gap-5">
          <div className="h-[16px] w-[64px] bg-paper rounded-sm" />
          <div>
            <div className="h-[60px] w-[420px] max-w-full bg-paper rounded-sm" />
            <div className="mt-3 h-[24px] w-[560px] max-w-full bg-paper rounded-sm" />
            <div className="mt-6 h-[240px] w-full bg-paper rounded-lg" />
          </div>
        </div>
      </section>
    </main>
  );
}
