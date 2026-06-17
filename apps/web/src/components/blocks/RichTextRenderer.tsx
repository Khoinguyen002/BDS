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
      return <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>;
    case "heading":
      const Tag = (elNode.tag as keyof React.JSX.IntrinsicElements) || "h2";
      const headingClasses: Record<string, string> = {
        h1: "text-4xl font-bold mb-6 text-gray-900",
        h2: "text-3xl font-bold mb-4 text-gray-900",
        h3: "text-2xl font-bold mb-3 text-gray-900",
        h4: "text-xl font-bold mb-2 text-gray-900",
        h5: "text-lg font-bold mb-2 text-gray-900",
        h6: "text-base font-bold mb-2 text-gray-900",
      };
      return <Tag className={headingClasses[Tag as string] || headingClasses.h2}>{children}</Tag>;
    case "list":
      const ListTag = elNode.tag === "ol" ? "ol" : "ul";
      const listClass = elNode.tag === "ol" ? "list-decimal ml-6 mb-4" : "list-disc ml-6 mb-4";
      return <ListTag className={listClass}>{children}</ListTag>;
    case "listitem":
      return <li className="mb-1 text-gray-700">{children}</li>;
    case "quote":
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
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
    <div className="prose prose-blue max-w-none">
      <NodeRenderer node={content.root} />
    </div>
  );
}
