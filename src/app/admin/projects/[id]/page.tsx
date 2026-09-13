import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/project-editor";
import { getProjectForEditor } from "@/lib/admin/admin-queries";
import { getProjectMedia } from "@/lib/admin/media-queries";
import { signPreview } from "@/lib/preview";

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProjectForEditor(id);
  if (!data) notFound();
  const media = await getProjectMedia(id);
  return <ProjectEditor data={data} previewToken={signPreview(data.slug)} media={media} />;
}
