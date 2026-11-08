import type { Block } from "./types";

/**
 * Copy for the site assistant (the "Ask Caparison" widget on every public
 * page). Merged over the base blocks in seed.ts by key. {email} is replaced
 * with the studio email from Settings.
 */
const g = "Assistant";

export const blocks: Block[] = [
  { key: "chat.launcher.label", group: g, label: "Launcher: label", value: "Questions? Ask our assistant", helpText: "Shown beside the round button a few seconds after the page loads, and on hover." },
  { key: "chat.launcher.open", group: g, label: "Launcher: open (screen readers)", value: "Open the assistant" },
  { key: "chat.launcher.close", group: g, label: "Launcher: close (screen readers)", value: "Close the assistant" },
  { key: "chat.title", group: g, label: "Panel title", value: "Caparison assistant" },
  { key: "chat.status", group: g, label: "Status line", value: "Answers in seconds, a person follows up" },
  { key: "chat.close", group: g, label: "Close button", value: "Close" },
  { key: "chat.reset", group: g, label: "Start over button", value: "Start over" },
  {
    key: "chat.greeting",
    group: g,
    label: "Greeting",
    value: "Hi. Ask me about our services, prices, timelines, or how working with a studio in Dhaka works. If I don't know something, I'll say so.",
  },
  { key: "chat.suggestionsLabel", group: g, label: "Suggested questions: label", value: "People often ask" },
  {
    key: "chat.suggestions",
    group: g,
    label: "Suggested questions",
    value: "What does a website cost?\nHow does working with a team in Dhaka work?\nWhat's in the free website review?",
    helpText: "One per line. The first three are shown.",
  },
  { key: "chat.inputLabel", group: g, label: "Input: label (screen readers)", value: "Your question" },
  { key: "chat.placeholder", group: g, label: "Input: placeholder", value: "Ask a question" },
  { key: "chat.send", group: g, label: "Send button", value: "Send" },
  { key: "chat.charsLeft", group: g, label: "Characters left", value: "{n} characters left", helpText: "Shown near the limit. {n} is the number." },
  { key: "chat.typing", group: g, label: "Writing indicator (screen readers)", value: "Writing a reply" },
  { key: "chat.saving", group: g, label: "Sending details note", value: "Sending your details to the team" },
  { key: "chat.leadSaved", group: g, label: "Details sent note", value: "Details sent. A person replies by email within one working day." },
  { key: "chat.youLabel", group: g, label: "Visitor message label (screen readers)", value: "You" },
  { key: "chat.botLabel", group: g, label: "Assistant message label (screen readers)", value: "Assistant" },
  { key: "chat.reviewPrompt", group: g, label: "Footer: line before the link", value: "Want a person to look at your site?" },
  { key: "chat.reviewLink", group: g, label: "Footer: review link", value: "Get a free website review" },
  {
    key: "chat.disclaimer",
    group: g,
    label: "Footer: note",
    value: "Answers come from an AI model that only uses what this site says. It can still get things wrong.",
  },
  {
    key: "chat.unconfigured",
    group: g,
    label: "Message: assistant not switched on",
    value: "The assistant isn't switched on yet. Email us at {email} and a person will reply within one working day.",
  },
  {
    key: "chat.error.rateLimited",
    group: g,
    label: "Message: too many questions",
    value: "That's the limit for this hour. Email us at {email} and we'll pick it up from there.",
  },
  {
    key: "chat.error.busy",
    group: g,
    label: "Message: busy",
    value: "The assistant is busy right now. Try again in a minute, or email us at {email}.",
  },
  {
    key: "chat.error.refused",
    group: g,
    label: "Message: off-limits question",
    value: "I can't help with that one. Ask me about our services, prices or process, or email us at {email}.",
  },
  {
    key: "chat.error.generic",
    group: g,
    label: "Message: something went wrong",
    value: "Something went wrong on our side. Try again, or email us at {email}.",
  },
];
