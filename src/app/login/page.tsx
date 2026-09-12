import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

/** Single admin, no signup route. Left-aligned narrow column, no spine. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <main id="main" className="min-h-svh bg-bone px-3 md:px-[48px]">
      <div className="max-w-[400px] pt-6 md:pt-7">
        <img src="/brand/wordmark-ink.png" alt="Caparison Lab" width={761} height={203} className="w-[128px] h-auto" />
        <h1 className="mt-5 text-h2">Sign in</h1>
        <p className="mt-1 text-body text-ash">Admin panel. One account, no signups.</p>
        <div className="mt-4">
          <LoginForm next={next} initialError={error === "forbidden" ? "That account isn't authorised for the admin panel." : undefined} />
        </div>
      </div>
    </main>
  );
}
