import { redirect } from "next/navigation";

/** Old detail links open the inbox with the drawer. */
export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/inquiries?id=${encodeURIComponent(id)}`);
}
