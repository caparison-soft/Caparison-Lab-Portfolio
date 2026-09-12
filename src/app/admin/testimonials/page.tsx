import { EntityPage } from "@/components/admin/entity-page";
import { getProjectOptions } from "@/lib/admin/admin-queries";

export default async function TestimonialsAdmin() {
  const projects = await getProjectOptions();
  return (
    <EntityPage
      entity="testimonial"
      marker="testimonials"
      heading="Testimonials"
      intro="Featured quotes rotate on the homepage by hand, never automatically."
      singular="testimonial"
      plural="testimonials"
      featuredToggle
      blank={{ quote: "", authorName: "", authorRole: "", company: "", avatarUrl: "", companyLogoUrl: "", projectId: "", featured: false, status: "DRAFT" }}
      fields={[
        { name: "quote", label: "Quote", type: "textarea", max: 600 },
        { name: "authorName", label: "Name", type: "text" },
        { name: "authorRole", label: "Role", type: "text" },
        { name: "company", label: "Company", type: "text" },
        { name: "projectId", label: "Project", type: "select", options: [{ value: "", label: "None" }, ...projects.map((p) => ({ value: p.id, label: p.title }))] },
        { name: "avatarUrl", label: "Avatar URL", type: "url" },
        { name: "companyLogoUrl", label: "Company logo URL", type: "url" },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
        { name: "featured", label: "Featured on the homepage", type: "toggle" },
      ]}
    />
  );
}
