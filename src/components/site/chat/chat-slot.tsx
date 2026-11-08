import { getBlocks, getSettings, lines, t } from "@/lib/queries/content";
import { ChatWidget, type ChatLabels } from "./chat-widget";

const KEYS = [
  "chat.launcher.label",
  "chat.launcher.open",
  "chat.launcher.close",
  "chat.title",
  "chat.status",
  "chat.close",
  "chat.reset",
  "chat.greeting",
  "chat.suggestionsLabel",
  "chat.inputLabel",
  "chat.placeholder",
  "chat.send",
  "chat.charsLeft",
  "chat.typing",
  "chat.saving",
  "chat.leadSaved",
  "chat.youLabel",
  "chat.botLabel",
  "chat.reviewPrompt",
  "chat.reviewLink",
  "chat.disclaimer",
  "chat.unconfigured",
  "chat.error.rateLimited",
  "chat.error.busy",
  "chat.error.refused",
  "chat.error.generic",
] as const;

/** The site assistant: loads its copy and the studio email, renders the widget. */
export async function ChatSlot() {
  const [blocks, settings] = await Promise.all([getBlocks(["Assistant"]), getSettings()]);
  const labels = Object.fromEntries(KEYS.map((k) => [k, t(blocks, k)])) as ChatLabels;
  const suggestions = lines(t(blocks, "chat.suggestions")).slice(0, 3);
  return <ChatWidget labels={labels} suggestions={suggestions} email={settings.email} />;
}
