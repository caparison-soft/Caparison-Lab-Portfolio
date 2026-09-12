import { ContentEditor } from "@/components/admin/content-editor";
import { getContentGroups } from "@/lib/admin/admin-queries";

export default async function ContentPage() {
  const groups = await getContentGroups();
  return (
    <div className="flex flex-col gap-3 max-w-[900px]">
      <header>
        <p className="text-small text-ash max-w-none">content</p>
        <h1 className="text-h2 mt-[4px]">Copy</h1>
        <p className="mt-1 text-body text-ash">Every string on the public site. Save a group to publish its changes.</p>
      </header>
      <ContentEditor groups={groups} />
    </div>
  );
}
