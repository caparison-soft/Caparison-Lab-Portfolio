import Link from "next/link";
import type { ReactNode } from "react";
import { MediaFrame } from "@/components/ui";
import { cx } from "@/lib/cx";

/**
 * Renders Tiptap JSON to React on the server. No innerHTML. Unknown node
 * types render their children so a new extension never blanks a page.
 */

type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string; marks?: Mark[] };

function isDoc(v: unknown): v is Node {
  return typeof v === "object" && v !== null && "type" in v;
}

function renderText(node: Node, key: number): ReactNode {
  let el: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        el = <strong key={key} className="font-medium text-ink">{el}</strong>;
        break;
      case "italic":
        el = <em key={key}>{el}</em>;
        break;
      case "code":
        el = <code key={key} className="data bg-paper border border-divider-light rounded-sm px-[4px]">{el}</code>;
        break;
      case "link": {
        const href = String(mark.attrs?.href ?? "#");
        const external = /^https?:\/\//.test(href);
        el = external ? (
          <a key={key} href={href} rel="noopener noreferrer" target="_blank">{el}</a>
        ) : (
          <Link key={key} href={href}>{el}</Link>
        );
        break;
      }
      default:
        break;
    }
  }
  return el;
}

function renderChildren(node: Node): ReactNode[] {
  return (node.content ?? []).map((child, i) => renderNode(child, i));
}

function renderNode(node: Node, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key} className="text-body text-ink max-w-[68ch]">{renderChildren(node)}</p>;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      // h2 inside a case body is a section marker: lowercase route-style, hairline above.
      if (level <= 2) {
        return (
          <h2 key={key} className="text-body font-medium text-ash border-t border-divider-light pt-2 mt-5 first:mt-0 max-w-none">
            {renderChildren(node)}
          </h2>
        );
      }
      return <h3 key={key} className="text-h4 font-medium mt-3">{renderChildren(node)}</h3>;
    }
    case "bulletList":
      return <ul key={key} className="list-none m-0 p-0 flex flex-col gap-1 max-w-[68ch]">{renderChildren(node)}</ul>;
    case "orderedList":
      return <ol key={key} className="list-none m-0 p-0 flex flex-col gap-1 max-w-[68ch] [counter-reset:item]">{renderChildren(node)}</ol>;
    case "listItem":
      return (
        <li key={key} className="flex gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-olive-400 flex-none mt-[10px]" />
          <div className="flex flex-col gap-1 [&>p]:max-w-none">{renderChildren(node)}</div>
        </li>
      );
    case "blockquote":
      return <blockquote key={key} className="m-0 pl-3 border-l-2 border-lime text-body-l text-ink max-w-[52ch]">{renderChildren(node)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key} className="data bg-olive-950 text-bone rounded-sm p-2 overflow-x-auto max-w-none">
          <code>{(node.content ?? []).map((c) => c.text ?? "").join("")}</code>
        </pre>
      );
    case "callout":
      return <aside key={key} className="bg-paper border border-divider-light rounded-lg p-3 max-w-[68ch] [&>p]:max-w-none">{renderChildren(node)}</aside>;
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} className="border-0 border-t border-divider-light my-3" />;
    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      const width = Number(node.attrs?.width ?? 16);
      const height = Number(node.attrs?.height ?? 10);
      if (!src) return null;
      return (
        <figure key={key} className="m-0 my-3 w-full">
          <MediaFrame width={width} height={height}>
            <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
          </MediaFrame>
          {node.attrs?.title ? <figcaption className="mt-1 text-small text-ash">{String(node.attrs.title)}</figcaption> : null}
        </figure>
      );
    }
    default:
      return <div key={key}>{renderChildren(node)}</div>;
  }
}

export function RichText({ content, className }: { content: unknown; className?: string }) {
  if (!isDoc(content)) return null;
  return <div className={cx("flex flex-col gap-2", className)}>{renderChildren(content)}</div>;
}

/** Plain text with blank-line paragraphs (used by RICHTEXT blocks seeded as text). */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {paras.map((p, i) => <p key={i} className="max-w-[68ch]">{p}</p>)}
    </div>
  );
}
