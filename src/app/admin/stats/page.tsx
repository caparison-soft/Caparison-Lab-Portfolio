import { EntityPage } from "@/components/admin/entity-page";

export default function StatsAdmin() {
  return (
    <EntityPage
      entity="stat"
      marker="stats"
      heading="Stats"
      intro="The by-the-numbers sheet on the about page."
      singular="stat"
      plural="stats"
      blank={{ label: "", value: "", note: "", status: "PUBLISHED" }}
      fields={[
        { name: "value", label: "Value", type: "text", help: "e.g. 34, 60%, 7" },
        { name: "label", label: "Label", type: "text", help: "e.g. projects shipped" },
        { name: "note", label: "Note", type: "text", span: 2 },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
      ]}
    />
  );
}
