import React from "react";

// Types for basic Lexical AST
type TextNode = {
  type: "text";
  text: string;
  format: number; // 1: bold, 2: italic, 8: underline, 16: code, etc.
};

type ElementNode = {
  type: string;
  tag?: string;
  children?: Array<TextNode | ElementNode>;
  format?: string;
  indent?: number;
};

type LexicalRoot = {
  root: ElementNode;
};

const TextRenderer = ({ node }: { node: TextNode }) => {
  let text = <>{node.text}</>;

  if (node.format & 1) text = <strong>{text}</strong>;
  if (node.format & 2) text = <em>{text}</em>;
  if (node.format & 8) text = <u>{text}</u>;
  if (node.format & 16) text = <code>{text}</code>;

  return text;
};

const NodeRenderer = ({ node }: { node: ElementNode | TextNode }) => {
  if (node.type === "text") {
    return <TextRenderer node={node as TextNode} />;
  }

  const elNode = node as ElementNode;
  const children = elNode.children?.map((child, i) => (
    <NodeRenderer key={i} node={child} />
  ));

  switch (elNode.type) {
    case "paragraph":
      return <p className="mb-3 text-[15px] text-foreground-secondary leading-relaxed">{children}</p>;
    case "heading":
      const Tag = (elNode.tag as keyof React.JSX.IntrinsicElements) || "h2";
      const headingMargin: Record<string, string> = {
        h1: "mb-4", h2: "mb-3", h3: "mb-2", h4: "mb-2", h5: "mb-2", h6: "mb-2",
      };
      return <Tag className={`font-bold ${headingMargin[Tag as string] || "mb-3"}`}>{children}</Tag>;
    case "list":
      const ListTag = elNode.tag === "ol" ? "ol" : "ul";
      const listClass = elNode.tag === "ol" ? "list-decimal ml-6 mb-4" : "list-disc ml-6 mb-4";
      return <ListTag className={listClass}>{children}</ListTag>;
    case "listitem":
      return <li className="mb-1 text-[15px] text-zinc-700 dark:text-zinc-300">{children}</li>;
    case "quote":
      return (
        <blockquote className="border-l-4 border-(--theme-primary) pl-4 italic text-foreground-secondary my-4">
          {children}
        </blockquote>
      );
    default:
      // Render children directly if node type is unknown (like root)
      return <>{children}</>;
  }
};

export default function RichTextRenderer({ content }: { content: LexicalRoot }) {
  if (!content || !content.root) return null;
  return (
    <div className="prose max-w-none dark:prose-invert prose-zinc">
      <NodeRenderer node={content.root} />
    </div>
  );
}
