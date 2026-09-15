import { EntityPage } from "@/components/admin/entity-page";

// Server actions on this page confirm uploads (a 200 MB video may need a full read plus ffmpeg).
export const maxDuration = 300;

export default function CapabilitiesAdmin() {
  return (
    <EntityPage
      entity="capability"
      marker="capabilities"
      heading="Capabilities"
      intro="What we build. Each capability can carry an image for the home page hover slider."
      singular="capability"
      plural="capabilities"
      blank={{ title: "", slug: "", blurb: "", startingPrice: "", typicalTimeline: "", deliverables: [], weight: "1", imageId: "", imageIdPreview: "", status: "DRAFT" }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "slug", slugFrom: "title" },
        { name: "blurb", label: "Blurb", type: "textarea", max: 400 },
        { name: "startingPrice", label: "Starting price", type: "text", help: "e.g. from $8k" },
        { name: "typicalTimeline", label: "Typical timeline", type: "text", help: "e.g. 6 – 10 weeks" },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
        { name: "deliverables", label: "Deliverables", type: "list" },
        { name: "imageId", label: "Home page image", type: "image", help: "Shown on the home page when this capability is hovered." },
      ]}
    />
  );
}
