import Link from "next/link";
import { Button, DataLine } from "@/components/ui";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status";
import { RevalidateButton } from "@/components/admin/revalidate-button";
import { getDashboard } from "@/lib/admin/queries";

function when(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

const statusLabels: Record<string, string> = { NEW: "new", READ: "read", REPLIED: "replied", QUALIFIED: "qualified", WON: "won", LOST: "lost" };

function describe(a: { action: string; entity: string; entityId: string | null; diff: unknown }): string {
  const d = (a.diff ?? {}) as Record<string, unknown>;
  if (a.action === "inquiry.status" && typeof d.from === "string" && typeof d.to === "string") {
    return `moved an enquiry from ${statusLabels[d.from] ?? d.from} to ${statusLabels[d.to] ?? d.to}`;
  }
  if (a.action === "auth.login_failed" || a.action === "auth.login_blocked") return `${actionLabels[a.action]} for ${a.entityId ?? "unknown"}`;
  return actionLabels[a.action] ?? `${a.action} ${a.entity}${a.entityId ? ` ${a.entityId}` : ""}`;
}

const actionLabels: Record<string, string> = {
  "auth.login": "signed in",
  "auth.logout": "signed out",
  "auth.login_failed": "failed sign-in",
  "auth.login_blocked": "sign-in blocked",
  "inquiry.status": "changed enquiry status",
  "site.revalidate": "revalidated the site",
};

export default async function AdminDashboard() {
  const d = await getDashboard();

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-small text-ash max-w-none">dashboard</p>
          <h1 className="text-h2 mt-[4px]">
            {d.inquiries.unread > 0 ? `${d.inquiries.unread} new ${d.inquiries.unread === 1 ? "enquiry" : "enquiries"}` : "Nothing new"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" href="/admin/projects/new">New project</Button>
          <Button size="sm" variant="secondary" href="/admin/testimonials/new">New testimonial</Button>
        </div>
      </header>

      <section aria-labelledby="counts">
        <h2 id="counts" className="sr-only">Counts</h2>
        <div className="sheet grid-cols-2 md:grid-cols-6">
          {[
            { label: "published", value: d.counts.projectsPublished, href: "/admin/projects?status=PUBLISHED" },
            { label: "drafts", value: d.counts.projectsDraft, href: "/admin/projects?status=DRAFT" },
            { label: "archived", value: d.counts.projectsArchived, href: "/admin/projects?status=ARCHIVED" },
            { label: "capabilities", value: d.counts.capabilities, href: "/admin/capabilities" },
            { label: "testimonials", value: d.counts.testimonials, href: "/admin/testimonials" },
            { label: "media", value: d.counts.media, href: "/admin/media" },
          ].map((c) => (
            <Link key={c.label} href={c.href} className="block p-2 bg-bone hover:bg-paper no-underline transition-colors dur-fast">
              <p className="font-mono text-h3 text-ink max-w-none tabular-nums">{c.value}</p>
              <p className="text-small text-ash max-w-none">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent" className="hidden md:block">
        <div className="flex items-baseline justify-between mb-2">
          <h2 id="recent" className="text-h4 font-medium">Recent enquiries</h2>
          <Link href="/admin/inquiries" className="text-small font-medium text-ash hover:text-ink no-underline">All enquiries ({d.inquiries.total})</Link>
        </div>
        {d.recentInquiries.length === 0 ? (
          <p className="text-body text-ash">No enquiries yet. They arrive here when someone sends the contact form.</p>
        ) : (
          <ol className="list-none m-0 p-0 border-t border-divider-light">
            {d.recentInquiries.map((q) => (
              <li key={q.id} className={`grid grid-cols-[minmax(0,1fr)_150px] gap-3 items-start py-2 border-b border-divider-light ${q.status === "NEW" ? "is-active pl-2 bg-paper" : "pl-2"}`}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <Link href={`/admin/inquiries/${q.id}`} className={`no-underline ${q.status === "NEW" ? "font-medium text-ink" : "text-ink"}`}>{q.name}</Link>
                    <span className="text-small text-ash">{q.company ?? q.email}</span>
                    {q.sourceProject ? <span className="text-small text-ash">via {q.sourceProject.title}</span> : null}
                  </div>
                  <p className="text-small text-ash max-w-[70ch] truncate">{q.message}</p>
                  <DataLine className="mt-[4px]" items={[{ value: when(q.createdAt) }, ...(q.budgetBand ? [{ value: q.budgetBand }] : [])]} />
                </div>
                <InquiryStatusSelect id={q.id} status={q.status} label={`Status for ${q.name}`} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="recent-mobile" className="md:hidden">
        <h2 id="recent-mobile" className="text-h4 font-medium mb-2">Recent enquiries</h2>
        <ol className="list-none m-0 p-0 border-t border-divider-light">
          {d.recentInquiries.map((q) => (
            <li key={q.id} className="py-2 border-b border-divider-light">
              <Link href={`/admin/inquiries/${q.id}`} className="no-underline text-ink font-medium">{q.name}</Link>
              <p className="text-small text-ash max-w-none truncate">{q.message}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <section aria-labelledby="activity">
          <h2 id="activity" className="text-h4 font-medium mb-2">Recent activity</h2>
          {d.activity.length === 0 ? (
            <p className="text-body text-ash">No activity yet.</p>
          ) : (
            <ol className="list-none m-0 p-0 border-t border-divider-light">
              {d.activity.map((a) => (
                <li key={a.id} className="grid grid-cols-[140px_minmax(0,1fr)] gap-2 py-1 border-b border-divider-light items-baseline">
                  <span className="data text-ash">{when(a.createdAt)}</span>
                  <span className="text-small text-ink">
                    <span className="text-ash">{a.userEmail ?? "system"}</span> {describe(a)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="deploy" className="bg-paper border border-divider-light rounded-lg p-3">
          <h2 id="deploy" className="text-h4 font-medium">Site</h2>
          <p className="mt-1 text-small text-ash max-w-none">Every save already refreshes the public pages. Use this if something looks stale.</p>
          <div className="mt-3">
            <RevalidateButton last={d.lastRevalidation} />
          </div>
        </section>
      </div>
    </div>
  );
}
