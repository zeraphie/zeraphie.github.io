/* ─ devlog-dates — when an entry was written ─
 *
 * A devlog entry's date is not authored, it is discovered: the
 * commit that ADDED the entry is the day it was written. `git log
 * -L <range>:<file> --reverse` traces a line range back through
 * history, so the first commit it reports is the one that
 * introduced those lines. Deliberately not the latest commit for
 * the range — that would move an entry's date every time a typo in
 * it was fixed. An uncommitted entry has no date, which is right:
 * it is not published yet. Build-time only; needs full history. */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** `## [!log] Title` — the marker the remark plugin strips later. */
const LOG_HEADING = /^##\s+\[!log\]/i;
const ANY_H2 = /^##\s+(?!#)/;
const FENCE = /^\s*(```|~~~)/;

/**
 * Line ranges of the `[!log]` h2s in a markdown file, keyed by the
 * heading's position among ALL h2s in document order. Order is the
 * join key rather than the slug: Astro slugifies headings with its
 * own rules, and re-deriving them here would be a second source of
 * truth that could drift.
 */
function logHeadingRanges(text: string): Map<number, [number, number]> {
  const lines = text.split(/\r?\n/);
  const heads: { line: number; isLog: boolean }[] = [];
  let fenced = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Headings inside a fenced block are code, not structure.
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced && ANY_H2.test(line)) {
      heads.push({ line: i + 1, isLog: LOG_HEADING.test(line) });
    }
  }

  const ranges = new Map<number, [number, number]>();
  heads.forEach((head, index) => {
    if (!head.isLog) {
      return;
    }
    // The entry runs to the line before the next h2, or to the end.
    const end = heads[index + 1] ? heads[index + 1]!.line - 1 : lines.length;
    ranges.set(index, [head.line, Math.max(head.line, end)]);
  });
  return ranges;
}

/**
 * ISO date of the commit that introduced a line range, or null when
 * the range is uncommitted, the file is untracked, or history is too
 * shallow to trace it (a depth-1 CI clone cannot answer this).
 */
function introducedAt(file: string, from: number, to: number): string | null {
  try {
    const out = execFileSync(
      "git",
      ["log", "-L", `${from},${to}:${file}`, "--reverse", "--format=%cI", "-s"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const first = out.split("\n").find((l) => l.trim() !== "");
    return first ? first.trim().slice(0, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Dates for a post's devlog entries, keyed by the heading's index
 * among the post's h2s — the same order `render()` reports them in,
 * so a caller can zip the two lists together.
 *
 * @param file — repo-relative path to the markdown source
 */
export function devlogDates(file: string): Map<number, string> {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return new Map();
  }
  const dates = new Map<number, string>();
  for (const [index, [from, to]] of logHeadingRanges(text)) {
    const date = introducedAt(file, from, to);
    if (date) {
      dates.set(index, date);
    }
  }
  return dates;
}
