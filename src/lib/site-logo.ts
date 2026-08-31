/* ─ invader ─ the mark from the 2016 pen ─
 *
 * Two poses of a box-shadow sprite, ported from codepen QEEeJq: arms
 * down at rest, arms up and feet drawn in on engagement. The pen was
 * an @keyframes that swapped one box-shadow list for another, which
 * is the mechanism hp-pixel formalises — its file header names that
 * pen as the reference for its CSS-driven hover pattern.
 *
 * Both lists are 46 entries and index-aligned, because CSS
 * interpolates box-shadow pairwise: entry N of one list animates to
 * entry N of the other. The pen reached 46 by listing two foot pixels
 * TWICE as filler, and hp-pixel asserts the same rule ("all states
 * must have the same length") — so that padding is load-bearing and
 * has to survive the port. Twelve pixels move: six arms sweeping up
 * the sides, four feet collapsing into two pairs.
 *
 * Coordinates are centred on (0, 0), which is hp-pixel's own
 * convention. An 11x8 grid puts a half-step on y, so the pixel size
 * wants to be even for every offset to land on a whole pixel. */

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
