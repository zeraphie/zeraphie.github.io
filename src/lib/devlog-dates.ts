/* ─ devlog-dates — when an entry was written ─
 *
 * A devlog entry's date is discovered, not authored: the commit
 * that added the entry is the day it was written. The entry is
 * identified by its heading line; `git log -S` finds the commit
 * where that line first entered the file, so the date follows the
 * entry rather than its position.
 *
 * `git log -L` was the first attempt and is wrong: it traces line
 * positions, so an entry inserted where other text used to live
 * inherits that text's history. Only entries appended at the end
 * traced correctly — exactly the case that hides the bug.
 *
 * Renaming an entry re-dates it: the heading is the identity. An
 * uncommitted entry has no date — it is not published yet.
 * Build-time only; needs full history. */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** `## [!log] Title`, or `## [!log date:2026-08-30] Title` — the
 * marker the remark plugin strips later. */
const LOG_HEADING = /^##\s+\[!log(?:\s+[^\]]*)?\]/i;
/** An explicit date on the marker wins over history. Only the strict
 * shape counts: anything else falls back to the commit, so a typo
 * shows a real date rather than a broken one. */
const DATE_OPTION = /\[!log[^\]]*\bdate:(\d{4}-\d{2}-\d{2})/i;
const ANY_H2 = /^##\s+(?!#)/;
const FENCE = /^\s*(```|~~~)/;

/**
 * The `[!log]` headings of a markdown file, keyed by their position
 * among ALL h2s in document order. Order is the join key rather than
 * the slug: Astro slugifies headings with its own rules, and
 * re-deriving them here would be a second source of truth that could
 * drift. Headings inside a fenced block are code, not structure.
 */
function logHeadings(text: string): Map<number, string> {
  const found = new Map<number, string>();
  let h2s = 0;
  let fenced = false;

  for (const line of text.split(/\r?\n/)) {
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced || !ANY_H2.test(line)) {
      continue;
    }
    if (LOG_HEADING.test(line)) {
      found.set(h2s, line.trimEnd());
    }
    h2s++;
  }
  return found;
}

/**
 * ISO date of the commit that first added `line` to `file`, or null
 * when it is uncommitted, the file is untracked, or history is too
 * shallow to look back (a depth-1 CI clone cannot answer this).
 */
function addedAt(file: string, line: string): string | null {
  try {
    const out = execFileSync(
      "git",
      ["log", "-S", line, "--reverse", "--format=%cI", "-s", "--", file],
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
  for (const [index, line] of logHeadings(text)) {
    const date = DATE_OPTION.exec(line)?.[1] ?? addedAt(file, line);
    if (date) {
      dates.set(index, date);
    }
  }
  return dates;
}
