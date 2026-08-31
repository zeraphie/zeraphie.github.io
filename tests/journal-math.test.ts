/* ─ journal-math tests — the journal's numbers, sans DOM ─
 *
 * Real layout is verified in the browser; these pin the arithmetic
 * the reader and the turn delegate to: geometry, clamping, the
 * pager's words, input mappings, and the drag physics' arc. */

import { describe, expect, it } from "bun:test";

import {
  clampLead,
  dirForCorner,
  dragProgress,
  easeOutCubic,
  flapVisible,
  foldDepth,
  keyIntent,
  measureColumns,
  pageAt,
  pageLabel,
  visibleTo,
} from "../src/lib/journal-math";

const spreadBox = {
  columnCount: 2,
  columnGap: 24,
  paddingLeft: 32,
  paddingRight: 32,
  clientWidth: 800,
  scrollWidth: 3200,
};

describe("measureColumns", () => {
  it("derives the page stride and count from column geometry", () => {
    const metrics = measureColumns(spreadBox);
    // column = (800 - 64 - 24) / 2 = 356, so the stride is 380.
    expect(metrics.perView).toBe(2);
    expect(metrics.unit).toBe(380);
    // pages = round((3200 - 64 + 24) / 380) = round(8.3) = 8.
    expect(metrics.count).toBe(8);
    expect(metrics.padLeft).toBe(32);
  });

  it("reads a columnCount of auto (NaN) as a single column", () => {
    expect(measureColumns({ ...spreadBox, columnCount: Number.NaN }).perView).toBe(1);
  });

  it("never reports fewer than one page", () => {
    expect(measureColumns({ ...spreadBox, scrollWidth: 0 }).count).toBe(1);
  });
});

describe("clampLead", () => {
  it("aligns the lead to the spread", () => {
    expect(clampLead(5, 8, 2)).toBe(4);
  });

  it("clamps below to the first page", () => {
    expect(clampLead(-3, 8, 2)).toBe(0);
  });

  it("clamps beyond the end to the last spread", () => {
    expect(clampLead(9, 8, 2)).toBe(6);
  });

  it("passes in-range leads through in notepad mode", () => {
    expect(clampLead(3, 8, 1)).toBe(3);
  });
});

describe("the pager", () => {
  it("caps the visible range at the last page", () => {
    expect(visibleTo(6, 8, 2)).toBe(8);
    expect(visibleTo(8, 9, 2)).toBe(9);
  });

  it("words a spread as a range", () => {
    expect(pageLabel(0, 9, 2)).toBe("page 1–2 of 9");
  });

  it("words a lone last page singly", () => {
    expect(pageLabel(8, 9, 2)).toBe("page 9 of 9");
  });

  it("words notepad pages singly", () => {
    expect(pageLabel(2, 3, 1)).toBe("page 3 of 3");
  });
});

describe("pageAt", () => {
  it("maps a content offset to its page", () => {
    expect(pageAt(0, 380, 8)).toBe(0);
    expect(pageAt(700, 380, 8)).toBe(1);
  });

  it("counts an exact column boundary as the page it opens", () => {
    expect(pageAt(379, 380, 8)).toBe(1);
  });

  it("clamps to the first and last page", () => {
    expect(pageAt(-50, 380, 8)).toBe(0);
    expect(pageAt(99_999, 380, 8)).toBe(7);
  });
});

describe("input mappings", () => {
  it("turns from the corner beside the spine on a spread", () => {
    expect(dirForCorner("tr", 2)).toBe(1);
    expect(dirForCorner("br", 2)).toBe(1);
    expect(dirForCorner("tl", 2)).toBe(-1);
    expect(dirForCorner("bl", 2)).toBe(-1);
  });

  it("turns from the bottom or top in notepad mode", () => {
    expect(dirForCorner("bl", 1)).toBe(1);
    expect(dirForCorner("tl", 1)).toBe(-1);
  });

  it("reads the reading keys", () => {
    expect(keyIntent("ArrowRight", false)).toBe("forward");
    expect(keyIntent("PageDown", false)).toBe("forward");
    expect(keyIntent(" ", false)).toBe("forward");
    expect(keyIntent(" ", true)).toBe("back");
    expect(keyIntent("ArrowLeft", false)).toBe("back");
    expect(keyIntent("PageUp", true)).toBe("back");
    expect(keyIntent("Home", false)).toBe("home");
    expect(keyIntent("End", true)).toBe("end");
  });

  it("ignores every other key", () => {
    expect(keyIntent("a", false)).toBeNull();
    expect(keyIntent("ArrowDown", false)).toBeNull();
  });
});

describe("dragProgress", () => {
  const spread = { spread: true, dir: 1 as const, left: 100, top: 0, width: 600, height: 800 };

  it("rides the leaf's edge around the spine", () => {
    expect(dragProgress(spread, 700, 0)).toBe(0); // resting edge
    expect(dragProgress(spread, 400, 0)).toBeCloseTo(0.5, 12); // the vertical
    expect(dragProgress(spread, 100, 0)).toBeCloseTo(1, 12); // laid flat
  });

  it("clamps a pointer past the physical edge onto the arc", () => {
    expect(dragProgress(spread, 1000, 0)).toBe(0);
    expect(dragProgress(spread, -500, 0)).toBeCloseTo(1, 12);
  });

  it("mirrors for a backward turn", () => {
    const back = { ...spread, dir: -1 as const };
    expect(dragProgress(back, 100, 0)).toBe(0);
    expect(dragProgress(back, 700, 0)).toBeCloseTo(1, 12);
  });

  it("swings over the top edge in notepad mode", () => {
    const pad = { spread: false, dir: 1 as const, left: 0, top: 50, width: 600, height: 800 };
    expect(dragProgress(pad, 0, 850)).toBe(0); // bottom edge, at rest
    expect(dragProgress(pad, 0, 50)).toBeCloseTo(0.5, 12); // vertical at the top
  });
});

describe("the leaf's arc", () => {
  it("hands each half of the arc to its one-sided flap", () => {
    expect(flapVisible(0, 0.5, 0.3)).toBe(true);
    expect(flapVisible(0.5, 1, 0.3)).toBe(false);
    expect(flapVisible(0, 0.5, 0.5)).toBe(true);
    expect(flapVisible(0.5, 1, 0.5)).toBe(true);
  });

  it("shades deepest at the vertical", () => {
    expect(foldDepth(0, 0.25)).toBe(0.5);
    expect(foldDepth(0, 0.5)).toBe(1);
    expect(foldDepth(0, 0.75)).toBe(1);
    expect(foldDepth(0.5, 0.75)).toBe(0.5);
  });

  it("eases out cubically", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBe(0.875);
    expect(easeOutCubic(1)).toBe(1);
  });
});
