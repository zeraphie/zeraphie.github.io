/* ─ site-logo — the invader from the 2016 pen ─
 *
 * Two poses of a box-shadow sprite, ported from codepen QEEeJq:
 * arms down at rest, arms up and feet drawn in on engagement. The
 * pen swapped one box-shadow list for another in @keyframes — the
 * mechanism hp-pixel formalises.
 *
 * Both lists are 46 entries and index-aligned: CSS interpolates
 * box-shadow pairwise, entry N to entry N. The pen reached 46 by
 * listing two foot pixels twice, and hp-pixel requires equal
 * lengths, so the padding is load-bearing. Twelve pixels move: six
 * arms, four feet collapsing into two pairs.
 *
 * Coordinates centre on (0, 0), hp-pixel's convention. The 11x8
 * grid puts a half-step on y, so use an even pixel size to land
 * every offset on a whole pixel. */

import type { HpPixelPosition } from "@hexpunk/core";

export const INVADER_IDLE: HpPixelPosition[] = [
  [-3, -3.5],
  [-2, -2.5],
  [2, -2.5],
  [3, -3.5],
  [-3, -1.5],
  [-2, -1.5],
  [-1, -1.5],
  [0, -1.5],
  [1, -1.5],
  [2, -1.5],
  [3, -1.5],
  [-4, -0.5],
  [-3, -0.5],
  [-1, -0.5],
  [0, -0.5],
  [1, -0.5],
  [3, -0.5],
  [4, -0.5],
  [-5, 0.5],
  [-4, 0.5],
  [-3, 0.5],
  [-2, 0.5],
  [-1, 0.5],
  [0, 0.5],
  [1, 0.5],
  [2, 0.5],
  [3, 0.5],
  [4, 0.5],
  [5, 0.5],
  [-5, 1.5],
  [-3, 1.5],
  [-2, 1.5],
  [-1, 1.5],
  [0, 1.5],
  [1, 1.5],
  [2, 1.5],
  [3, 1.5],
  [5, 1.5],
  [-5, 2.5],
  [-3, 2.5],
  [3, 2.5],
  [5, 2.5],
  [-2, 3.5],
  [-1, 3.5],
  [1, 3.5],
  [2, 3.5],
];

export const INVADER_HOVER: HpPixelPosition[] = [
  [-3, -3.5],
  [-2, -2.5],
  [2, -2.5],
  [3, -3.5],
  [-3, -1.5],
  [-2, -1.5],
  [-1, -1.5],
  [0, -1.5],
  [1, -1.5],
  [2, -1.5],
  [3, -1.5],
  [-4, -0.5],
  [-3, -0.5],
  [-1, -0.5],
  [0, -0.5],
  [1, -0.5],
  [3, -0.5],
  [4, -0.5],
  [-5, -0.5],
  [-4, 0.5],
  [-3, 0.5],
  [-2, 0.5],
  [-1, 0.5],
  [0, 0.5],
  [1, 0.5],
  [2, 0.5],
  [3, 0.5],
  [4, 0.5],
  [5, -0.5],
  [-5, -1.5],
  [-3, 1.5],
  [-2, 1.5],
  [-1, 1.5],
  [0, 1.5],
  [1, 1.5],
  [2, 1.5],
  [3, 1.5],
  [5, -1.5],
  [-5, -2.5],
  [-2, 2.5],
  [2, 2.5],
  [5, -2.5],
  [-3, 3.5],
  [-3, 3.5],
  [3, 3.5],
  [3, 3.5],
];
