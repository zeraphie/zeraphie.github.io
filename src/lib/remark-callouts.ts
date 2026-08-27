/* ─ remark-callouts — the placed-note marker ─
 *
 * A blockquote whose first line is `[!note]` is a deliberate,
 * placed note: the marker line is removed and the blockquote gains
 * data-callout="note" for the journal's parchment dress to key on.
 * Unmarked quotes keep the quiet wireframe callout — notes stay
 * sparse because the author asks for each one. */

interface Node {
  type: string;
  value?: string;
  children?: Node[];
  data?: { hProperties?: Record<string, string> };
}

const MARKER = /^\[!note\]\s*/i;

function mark(quote: Node): void {
  const paragraph = quote.children?.[0];
  const first = paragraph?.children?.[0];
  if (
    paragraph?.type !== "paragraph" ||
    first?.type !== "text" ||
    !MARKER.test(first.value ?? "")
  ) {
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
    hProperties: { ...quote.data?.hProperties, "data-callout": "note" },
  };
}

function walk(node: Node): void {
  if (node.type === "blockquote") {
    mark(node);
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
