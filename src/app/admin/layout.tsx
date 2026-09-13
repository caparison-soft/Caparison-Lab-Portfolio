import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav, type AdminNavItem } from "@/components/admin/admin-nav";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * The admin shell: same brand, denser. Persistent left rail with the
 * section index; the lime cursor marks where you are. Below 768px only the
 * dashboard and the inbox are offered.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const newInquiries = await prisma.inquiry.count({ where: { status: "NEW" } });

  const items: AdminNavItem[] = [
    { href: "/admin", label: "Dashboard", mobile: true },
    { href: "/admin/inquiries", label: "Enquiries", badge: newInquiries, mobile: true },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/capabilities", label: "Capabilities" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/process", label: "Process" },
    { href: "/admin/faqs", label: "FAQs" },
    { href: "/admin/team", label: "Team" },
    { href: "/admin/stats", label: "Stats" },
    { href: "/admin/media", label: "Media" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-svh bg-bone">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="px-3 md:px-[24px] h-[48px] flex items-center gap-3 border-b border-divider-light bg-bone">
        <Link href="/admin" className="no-underline flex items-center gap-2">
          <img src="/brand/wordmark-ink.png" alt="Caparison Lab" width={384} height={102} className="w-[96px] h-[26px] object-contain" />
          <span className="text-small text-ash">admin</span>
        </Link>
        <Link href="/" className="ml-auto text-small font-medium text-ash hover:text-ink no-underline" target="_blank" rel="noopener">
          View site
        </Link>
        <span className="hidden md:inline text-small text-ash">{user.email}</span>
        <form action={signOut}>
          <button type="submit" className="text-small font-medium text-ash hover:text-ink rounded-sm px-1 -mx-1">Sign out</button>
        </form>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="border-b md:border-b-0 md:border-r border-divider-light md:min-h-[calc(100svh-48px)] py-2 md:py-3">
          <AdminNav items={items} />
          <p className="md:hidden px-2 pt-2 text-small text-ash max-w-none">
            On a phone you get the dashboard and enquiries. Editing opens on a screen 768px or wider.
          </p>
        </aside>
        <main id="main" className="min-w-0 px-3 md:px-[24px] py-3 md:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
