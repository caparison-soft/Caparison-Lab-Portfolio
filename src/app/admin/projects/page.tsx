import { Button } from "@/components/ui";
import { ProjectsTable } from "@/components/admin/projects-table";
import { getProjectList } from "@/lib/admin/admin-queries";
import { createProject } from "@/lib/admin/project-actions";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { rows, categories } = await getProjectList();
  return (
    <div className="flex flex-col gap-3 max-w-[1100px]">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-small text-ash max-w-none">projects</p>
          <h1 className="text-h2 mt-[4px]">Projects</h1>
        </div>
        <form action={createProject}><Button type="submit" size="sm">New project</Button></form>
      </header>
      {rows.length === 0 ? (
        <div className="py-5">
          <p className="text-body-l text-ash">No projects yet. Add your first one.</p>
          <form action={createProject} className="mt-3"><Button type="submit">New project</Button></form>
        </div>
      ) : (
        <ProjectsTable rows={rows} categories={categories} initialStatus={status} />
      )}
    </div>
  );
}
