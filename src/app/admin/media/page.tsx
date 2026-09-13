import { MediaLibrary } from "@/components/admin/media-library";
import { getLatestReconcile, getMediaRows } from "@/lib/admin/media-queries";

export default async function MediaAdmin() {
  const [rows, report] = await Promise.all([getMediaRows(), getLatestReconcile()]);
  return (
    <div className="flex flex-col gap-3 max-w-[1100px]">
      <header>
        <p className="text-small text-ash max-w-none">media</p>
        <h1 className="text-h2 mt-[4px]">Media library</h1>
        <p className="mt-1 text-body text-ash">Every image and video in R2 with a record here. Items in use cannot be deleted until they are removed from the project first.</p>
      </header>
      <MediaLibrary rows={rows} report={report} />
    </div>
  );
}
