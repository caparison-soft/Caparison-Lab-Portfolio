"use client";
// Client component: Tiptap needs the DOM. Stores JSON; rendered on the server elsewhere.

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect } from "react";
import { cx } from "@/lib/cx";

/** A callout: a bordered paper panel holding blocks. */
const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() { return [{ tag: "aside[data-callout]" }]; },
  renderHTML({ HTMLAttributes }) { return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0]; },
});

type RichTextEditorProps = { value: unknown; onChange: (json: unknown) => void; id?: string; label?: string };

export function RichTextEditor({ value, onChange, id, label }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      Image.configure({ inline: false, allowBase64: false }),
      Callout,
    ],
    content: (value as object | undefined) ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: { attributes: { class: "editor-prose min-h-[320px] outline-none", id: id ?? "body", "aria-label": label ?? "Body" } },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  useEffect(() => () => { editor?.destroy(); }, [editor]);

  if (!editor) return <div className="min-h-[320px] bg-paper border border-divider-light rounded-sm" aria-busy="true" />;

  const b = (active: boolean) => cx("h-[28px] px-1 rounded-sm text-small font-medium transition-colors dur-fast", active ? "bg-ink text-bone" : "text-ash hover:text-ink hover:bg-bone");
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const addImage = () => {
    const src = window.prompt("Image URL (uploads arrive in the media phase)");
    if (!src) return;
    const alt = window.prompt("Alt text (required)") ?? "";
    if (!alt.trim()) { window.alert("Alt text is required for every image."); return; }
    editor.chain().focus().setImage({ src, alt }).run();
  };

  return (
    <div className="border border-divider-light rounded-sm bg-paper">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-[2px] p-1 border-b border-divider-light">
        <button type="button" className={b(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Section</button>
        <button type="button" className={b(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Heading</button>
        <button type="button" className={b(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" className={b(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" className={b(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>List</button>
        <button type="button" className={b(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numbered</button>
        <button type="button" className={b(editor.isActive("link"))} onClick={setLink}>Link</button>
        <button type="button" className={b(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
        <button type="button" className={b(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>
        <button type="button" className={b(editor.isActive("callout"))} onClick={() => editor.chain().focus().toggleWrap("callout").run()}>Callout</button>
        <button type="button" className={b(false)} onClick={addImage}>Image</button>
        <span className="ml-auto flex gap-[2px]">
          <button type="button" className={b(false)} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>Undo</button>
          <button type="button" className={b(false)} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>Redo</button>
        </span>
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
