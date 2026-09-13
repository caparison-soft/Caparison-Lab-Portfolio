import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getInquiries } from "@/lib/admin/queries";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function cell(v: string | null | undefined): string {
  const s = (v ?? "").replace(/\r?\n/g, " ");
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV of every enquiry. Admin only; the middleware already requires a session. */
export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const rows = await getInquiries();
  const header = ["created", "status", "name", "email", "company", "phone", "budget", "timeline", "project", "sent_from", "referrer", "message", "notes"];
  const lines = rows.map((r) =>
    [r.createdAt, r.status, r.name, r.email, r.company, r.phone, r.budgetBand, r.timelineBand, r.sourceProject?.title ?? "", r.sourcePath, r.referrer, r.message, r.internalNotes].map(cell).join(","),
  );
  await logAudit({ userId: user.id, action: "inquiry.export", entity: "Inquiry", diff: { count: rows.length } });
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
