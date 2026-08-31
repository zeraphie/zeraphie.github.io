/**
 * ─ remark-callouts tests ─
 *
 * Trees are built by hand and run through the plugin. Inline
 * snapshots cover the cases where the whole output shape is the
 * contract: the plugin removes nodes, so "nothing else changed"
 * is part of the assertion.
 */

import { describe, expect, it } from "bun:test";

import { remarkCallouts } from "../src/lib/remark-callouts";

const text = (value: string) => ({ type: "text", value });
const link = (url: string) => ({ type: "link", url, children: [text(url)] });
const paragraph = (...children: unknown[]) => ({ type: "paragraph", children });
const blockquote = (...children: unknown[]) => ({ type: "blockquote", children });
const heading = (depth: number, ...children: unknown[]) => ({ type: "heading", depth, children });
const root = (...children: unknown[]) => ({ type: "root", children });

const run = (tree: any) => {
  remarkCallouts()(tree);
  return tree;
};

describe("blockquote markers", () => {
  it("dresses a marked quote and strips the marker", () => {
    const quote: any = blockquote(paragraph(text("[!note] Keep the door shut.")));
    run(root(quote));
    expect(quote.data.hProperties["data-callout"]).toBe("note");
    expect(quote.children[0].children[0].value).toBe("Keep the door shut.");
  });

  it("lowercases the marker name", () => {
    const quote: any = blockquote(paragraph(text("[!NOTE] Shouted marker.")));
    run(root(quote));
    expect(quote.data.hProperties["data-callout"]).toBe("note");
  });

  it("drops a marker on its own line, trailing break included", () => {
    const quote: any = blockquote(
      paragraph(text("[!quote]"), { type: "break" }, text("Intent line."))
    );
    run(root(quote));
    expect(quote).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "Intent line.",
              },
            ],
            "type": "paragraph",
          },
        ],
        "data": {
          "hProperties": {
            "data-callout": "quote",
          },
        },
        "type": "blockquote",
      }
    `);
  });

  it("removes a paragraph the marker leaves empty", () => {
    const quote: any = blockquote(paragraph(text("[!note]")), paragraph(text("Body.")));
    run(root(quote));
    expect(quote.data.hProperties["data-callout"]).toBe("note");
    expect(quote.children).toEqual([paragraph(text("Body."))]);
  });

  it("leaves an unmarked quote untouched", () => {
    const tree: any = root(blockquote(paragraph(text("Just a quiet quote."))));
    const before = structuredClone(tree);
    run(tree);
    expect(tree).toEqual(before);
  });
});

describe("heading markers", () => {
  it("marks an h2 log heading and strips the marker", () => {
    const h2: any = heading(2, text("[!log] Fixed the seams"));
    run(root(h2));
    expect(h2.data.hProperties["data-heading"]).toBe("log");
    expect(h2.children[0].value).toBe("Fixed the seams");
  });

  it("strips marker options along with the marker", () => {
    const h2: any = heading(2, text("[!log date:2026-08-30] Backdated entry"));
    run(root(h2));
    expect(h2.data.hProperties["data-heading"]).toBe("log");
    expect(h2.children[0].value).toBe("Backdated entry");
  });

  it("ignores markers on any depth but h2", () => {
    const h3: any = heading(3, text("[!log] Not a rail anchor"));
    const before = structuredClone(h3);
    run(root(h3));
    expect(h3).toEqual(before);
  });
});

describe("code refs", () => {
  it("turns a marker line into the block's reference link", () => {
    const para: any = paragraph(text("[!code ref:https://host/src/core/grid/layers.js#L29]"));
    run(root(para));
    expect(para).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "type": "text",
                "value": "layers.js#L29",
              },
            ],
            "data": {
              "hProperties": {
                "rel": "noopener noreferrer",
                "target": "_blank",
              },
            },
            "type": "link",
            "url": "https://host/src/core/grid/layers.js#L29",
          },
        ],
        "data": {
          "hProperties": {
            "class": "journal-code-ref",
          },
        },
        "type": "paragraph",
      }
    `);
  });

  it("survives the url having been autolinked", () => {
    const para: any = paragraph(
      text("[!code ref:"),
      link("https://host/src/core/grid/layers.js#L29"),
      text("]")
    );
    run(root(para));
    expect(para.data.hProperties.class).toBe("journal-code-ref");
    expect(para.children).toHaveLength(1);
    expect(para.children[0].url).toBe("https://host/src/core/grid/layers.js#L29");
    expect(para.children[0].children[0].value).toBe("layers.js#L29");
  });

  it("labels a hashless url with just the file", () => {
    const para: any = paragraph(text("[!code ref:https://host/css/app.css]"));
    run(root(para));
    expect(para.children[0].children[0].value).toBe("app.css");
  });

  it("ignores prose that merely mentions the marker", () => {
    const para: any = paragraph(text("see [!code ref:x] later"));
    const before = structuredClone(para);
    run(root(para));
    expect(para).toEqual(before);
  });
});

describe("dividers", () => {
  it("dresses a thematic break as the hexpunk separator", () => {
    const divider: any = { type: "thematicBreak" };
    run(root(divider));
    expect(divider.data.hProperties.className).toBe("hp-separator");
  });
});
