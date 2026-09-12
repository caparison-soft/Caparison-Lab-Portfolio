import { EntityPage } from "@/components/admin/entity-page";

export default function FaqsAdmin() {
  return (
    <EntityPage
      entity="faq"
      marker="faqs"
      heading="Questions"
      intro="Shown on the about page. Blank lines make paragraphs."
      singular="question"
      plural="questions"
      blank={{ question: "", answerText: "", group: "General", status: "PUBLISHED" }}
      fields={[
        { name: "question", label: "Question", type: "text", span: 2 },
        { name: "answerText", label: "Answer", type: "textarea", max: 3000 },
        { name: "group", label: "Group", type: "text" },
        { name: "status", label: "Status", type: "select", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }] },
      ]}
    />
  );
}
