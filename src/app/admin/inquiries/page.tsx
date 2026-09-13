import { Suspense } from "react";
import { InquiriesInbox } from "@/components/admin/inquiries-inbox";
import { getInquiries } from "@/lib/admin/queries";
import { getSettings } from "@/lib/queries/content";

export default async function InquiriesAdmin() {
  const [rows, settings] = await Promise.all([getInquiries(), getSettings()]);
  const unread = rows.filter((r) => r.status === "NEW").length;
  return (
    <div className="flex flex-col gap-3 max-w-[1240px]">
      <header>
        <p className="text-small text-ash max-w-none">enquiries</p>
        <h1 className="text-h2 mt-[4px]">{unread > 0 ? `${unread} new ${unread === 1 ? "enquiry" : "enquiries"}` : "Enquiries"}</h1>
      </header>
      <Suspense>
        <InquiriesInbox rows={rows} siteName={settings.siteName} />
      </Suspense>
    </div>
  );
}
