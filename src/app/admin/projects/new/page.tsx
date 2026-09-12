import { createProject } from "@/lib/admin/project-actions";

/** Creates a draft and redirects into the editor. */
export default async function NewProjectPage() {
  await createProject();
}
