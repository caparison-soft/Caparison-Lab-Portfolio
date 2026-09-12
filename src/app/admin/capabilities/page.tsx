import { EntityPage } from "@/components/admin/entity-page";

export default function CapabilitiesAdmin() {
  return (
    <EntityPage
      entity="capability"
      marker="capabilities"
      heading="Capabilities"
      intro="What we build. Weight sets the size of the cell on the homepage sheet."
      singular="capability"
      plural="capabilities"
      blank={{ title: "", slug: "", blurb: "", startingPrice: "", typicalTimeline: "", deliverables: [], weight: "1", status: "DRAFT" }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "slug", slugFrom: "title" },
        { name: "blurb", label: "Blurb", type: "textarea", max: 400 },
        { name: "startingPrice", label: "Starting price", type: "text", help: "e.g. from $8k" },
        { name: "typicalTimeline", label: "Typical timeline", type: "text", help: "e.g. 6 – 10 weeks" },
        { name: "weight", label: "Size on the homepage", type: "select", options: [{ value: "1", label: "Small" }, { value: "2", label: "Medium" }, { value: "3", label: "Large" }] },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
        { name: "deliverables", label: "Deliverables", type: "list" },
      ]}
      aside="weightPreview"
    />
  );
}
