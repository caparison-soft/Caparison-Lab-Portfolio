import { EntityPage } from "@/components/admin/entity-page";

export default function TeamAdmin() {
  return (
    <EntityPage
      entity="teamMember"
      marker="team"
      heading="Team"
      singular="person"
      plural="people"
      blank={{ name: "", role: "", bio: "", avatarUrl: "", status: "PUBLISHED" }}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "role", label: "Role", type: "text" },
        { name: "bio", label: "Bio", type: "textarea", max: 600 },
        { name: "avatarUrl", label: "Avatar URL", type: "url" },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
      ]}
    />
  );
}
