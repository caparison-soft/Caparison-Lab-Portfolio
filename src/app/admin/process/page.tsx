import { EntityPage } from "@/components/admin/entity-page";

export default function ProcessAdmin() {
  return (
    <EntityPage
      entity="processStep"
      marker="process"
      heading="Process"
      intro="A real sequence, so the order is the number."
      singular="step"
      plural="steps"
      blank={{ title: "", duration: "", description: "", status: "PUBLISHED" }}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "duration", label: "Duration", type: "text", help: "e.g. week 1, weeks 2 – 8. Shown in mono." },
        { name: "description", label: "Description", type: "textarea", max: 600 },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
      ]}
    />
  );
}
