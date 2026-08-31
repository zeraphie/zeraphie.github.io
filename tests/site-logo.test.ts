/* ─ site-logo tests ─
 *
 * The sprite header declares its rules: two index-aligned 46-entry
 * poses (box-shadow interpolates pairwise), twelve moving pixels,
 * whole-x half-step-y coordinates. Enforce them. */

import { describe, expect, it } from "bun:test";

import { INVADER_HOVER, INVADER_IDLE } from "../src/lib/site-logo";

describe("the invader's poses", () => {
  it("keeps both poses index-aligned at 46 entries", () => {
    expect(INVADER_IDLE).toHaveLength(46);
    expect(INVADER_HOVER).toHaveLength(46);
  });

  it("moves exactly twelve pixels between rest and engagement", () => {
    const moved = INVADER_IDLE.filter(
      ([x, y], i) => x !== INVADER_HOVER[i]![0] || y !== INVADER_HOVER[i]![1]
    );
    expect(moved).toHaveLength(12);
  });

  it("lands every pixel on the grid convention — whole x, half-step y", () => {
    for (const [x, y] of [...INVADER_IDLE, ...INVADER_HOVER]) {
      expect(Number.isInteger(x)).toBe(true);
      expect(Math.abs(y % 1)).toBe(0.5);
    }
  });
});
