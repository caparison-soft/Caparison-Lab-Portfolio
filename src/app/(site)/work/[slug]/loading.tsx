/**
 * What shows for the moment before a public page streams in, including the
 * first visit from a search result. Plain black, the home page's own ground
 * (owner, 2026-11-08: the light skeleton flashed before the black page).
 */
export default function SiteLoading() {
  return <main id="main" aria-busy="true" className="min-h-[100svh] bg-ink" />;
}
