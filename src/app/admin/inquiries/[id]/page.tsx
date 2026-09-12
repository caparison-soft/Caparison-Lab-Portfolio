import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await prisma.inquiry.findUnique({ where: { id }, include: { sourceProject: { select: { title: true, slug: true } } } });
  if (!q) notFound();
  return (
    <div className="max-w-[720px] flex flex-col gap-3">
      <p className="text-small text-ash max-w-none">enquiries / {q.name}</p>
      <h1 className="text-h2">{q.name}</h1>
      <p className="data text-ash max-w-none">{q.createdAt.toISOString().replace("T", " ").slice(0, 16)}  {q.email}{q.company ? `  ${q.company}` : ""}</p>
      <div className="w-[200px]"><InquiryStatusSelect id={q.id} status={q.status} label="Status" /></div>
      <p className="text-body text-ink whitespace-pre-wrap max-w-none">{q.message}</p>
      <dl className="grid grid-cols-[120px_1fr] gap-1 text-small border-t border-divider-light pt-2">
        <dt className="text-ash">budget</dt><dd className="data">{q.budgetBand ?? ""}</dd>
        <dt className="text-ash">timeline</dt><dd className="data">{q.timelineBand ?? ""}</dd>
        <dt className="text-ash">from page</dt><dd className="data">{q.sourcePath ?? ""}</dd>
        <dt className="text-ash">project</dt><dd>{q.sourceProject?.title ?? ""}</dd>
      </dl>
      <p className="text-small text-ash max-w-none">Notes, reply templates and the pipeline arrive in the enquiries phase.</p>
    </div>
  );
}
