import { EntityPage } from "@/components/admin/entity-page";

export default function TypesAdmin() {
  return (
    <EntityPage
      entity="category"
      marker="project types"
      heading="Project types"
      intro="The Type a project is filed under: shown on the case page, the work index filter and the enquiry form. A type in use cannot be deleted."
      singular="type"
      plural="types"
      noStatus
      blank={{ name: "", slug: "", description: "" }}
      fields={[
        { name: "name", label: "Name", type: "text", required: true, help: "e.g. Web application" },
        { name: "slug", label: "Slug", type: "slug", slugFrom: "name" },
        { name: "description", label: "Description", type: "text", span: 2, help: "Optional, admin-only note." },
      ]}
    />
  );
}
