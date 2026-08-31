/* ─ remark-callouts — the `[!name]` markers ─
 *
 * A marker on the first line asks for a treatment the dress cannot
 * infer. On a blockquote it is a deliberate, placed note —
 * data-callout="name", where `note` is the parchment handout and
 * `quote` its thin flavour for intent lines; unmarked quotes keep
 * the quiet wireframe callout. On a heading it names the kind of
 * heading — data-heading="log" opens a devlog entry. The marker
 * text is always removed, so slugs and rail labels never see it. */

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

/** The marker's own text, rebuilt from the nodes it became. By the
 * time this runs the URL has been autolinked, so the line is a text
 * node, a link, and a text node — and a link's label IS its url. */
function flatten(node: Node): string {
  if (node.type === "link") {
    return node.url ?? "";
  }
  if (node.children) {
    return node.children.map(flatten).join("");
  }
  return node.value ?? "";
}

/** `.../src/core/grid/layers.js#L29` → `layers.js#L29`. The full URL
 * is unreadable in a caption and wraps badly; the file and line are
 * the part a reader actually wants. */
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

/** `[!name]`, or `[!name key:value]` — the marker may carry options
 * for whoever consumes the kind (a devlog heading takes `date:`).
 * The whole marker is stripped either way, so slugs and rail labels
 * never see it; the options are read from the SOURCE, not the tree. */
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

/** Strips a leading `[!name]` from a heading and records the kind.
 * Only h2 carries one: h2s are the rail's anchors, so a marked
 * heading is a navigable thing, not a flourish. */
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
  // Content dividers wear hexpunk's separator (centre hex glyph).
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
