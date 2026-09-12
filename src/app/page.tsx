import Link from "next/link";

// Phase 1 placeholder. The homepage is built in Phase 3 from the database.
export default function Home() {
  return (
    <main id="main" className="px-3 py-6">
      <p className="data text-ash">phase 1 — foundation</p>
      <p className="mt-2">
        <Link href="/styleguide">Open the styleguide</Link>
      </p>
    </main>
  );
}
