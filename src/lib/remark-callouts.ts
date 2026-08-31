/**
 * ─ remark-callouts — the `[!name]` markers ─
 *
 * A first-line marker requests styling the markdown alone cannot
 * express. On a blockquote it sets data-callout="name" (`note` is
 * the parchment handout, `quote` its thin variant; unmarked quotes
 * keep the default callout). On an h2 it sets data-heading="name"
 * — "log" opens a devlog entry. The marker text is always removed,
 * so slugs and rail labels never see it.
 */

interface Node {
  type: string;
  value?: string;
  depth?: number;
  url?: string;
  children?: Node[];
  data?: { hProperties?: Record<string, string> };
}

/** `[!code ref:https://…]` alone on the line above a fence. */
const CODE_REF = /^\[!code\s+ref:(\S+)\]$/i;

/** Rebuild the marker line's text from its nodes. The URL has been
 * autolinked by now, so the line is text + link + text — and a
 * link's label is its url. */
function flatten(node: Node): string {
  if (node.type === "link") {
    return node.url ?? "";
  }
  if (node.children) {
    return node.children.map(flatten).join("");
  }
  return node.value ?? "";
}

/** `.../src/core/grid/layers.js#L29` → `layers.js#L29`: captions
 * want the file and line, not the full URL. */
function refLabel(url: string): string {
  const [path, hash] = url.split("#");
  const file = (path ?? "").split("/").filter(Boolean).pop() ?? url;
  return hash ? `${file}#${hash}` : file;
}

/** Turns the marker line into the block's reference link. */
function markCodeRef(node: Node): boolean {
  const match = CODE_REF.exec(flatten(node).trim());
  if (!match) {
    return false;
  }
  node.data = {
    ...node.data,
    hProperties: { ...node.data?.hProperties, class: "journal-code-ref" },
  };
  node.children = [
    {
      type: "link",
      url: match[1]!,
      children: [{ type: "text", value: refLabel(match[1]!) }],
      data: { hProperties: { target: "_blank", rel: "noopener noreferrer" } },
    },
  ];
  return true;
}

/** `[!name]` or `[!name key:value]`. Options are read from the
 * source, not the tree (a devlog heading takes `date:`); the whole
 * marker is stripped either way. */
const MARKER = /^\[!([a-z]+)(?:\s+[^\]]*)?\]\s*/i;

function mark(quote: Node): void {
  const paragraph = quote.children?.[0];
  const first = paragraph?.children?.[0];
  if (paragraph?.type !== "paragraph" || first?.type !== "text") {
    return;
  }
  const match = MARKER.exec(first.value ?? "");
  if (!match) {
    return;
  }
  first.value = (first.value ?? "").replace(MARKER, "");
  if (first.value === "") {
    paragraph.children!.shift();
    // The marker sat on its own line: drop the line break after it.
    if (paragraph.children![0]?.type === "break") {
      paragraph.children!.shift();
    }
    if (paragraph.children!.length === 0) {
      quote.children!.shift();
    }
  }
  quote.data = {
    ...quote.data,
    hProperties: { ...quote.data?.hProperties, "data-callout": match[1]!.toLowerCase() },
  };
}

/** Strip a leading `[!name]` from an h2 and record the kind. Only
 * h2s carry markers — they are the rail's anchors. */
function markHeading(heading: Node): void {
  if (heading.depth !== 2) {
    return;
  }
  const first = heading.children?.[0];
  if (first?.type !== "text") {
    return;
  }
  const match = MARKER.exec(first.value ?? "");
  if (!match) {
    return;
  }
  first.value = (first.value ?? "").replace(MARKER, "");
  heading.data = {
    ...heading.data,
    hProperties: { ...heading.data?.hProperties, "data-heading": match[1]!.toLowerCase() },
  };
}

function walk(node: Node): void {
  if (node.type === "blockquote") {
    mark(node);
  }
  if (node.type === "heading") {
    markHeading(node);
  }
  if (node.type === "paragraph") {
    markCodeRef(node);
  }
  // Dividers get hexpunk's separator (centre hex glyph).
  if (node.type === "thematicBreak") {
    node.data = {
      ...node.data,
      hProperties: { ...node.data?.hProperties, className: "hp-separator" },
    };
  }
  for (const child of node.children ?? []) {
    walk(child);
  }
}

export function remarkCallouts() {
  return (tree: Node) => {
    walk(tree);
  };
}
