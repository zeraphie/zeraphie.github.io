/* ─ devlog-dates tests — discovered dates, explicit and from git ─
 *
 * Parsing and the explicit-date path run against committed fixtures
 * and throwaway temp files (untracked → git answers null). The one
 * git-backed case is the shallow-clone canary: `git-dated.md` has no
 * explicit date, so its date must be discovered from the commit that
 * added it — null on a depth-1 clone, failing this suite by design. */

import { afterAll, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { devlogDates } from "../src/lib/devlog-dates";

const scratch = mkdtempSync(join(tmpdir(), "devlog-dates-"));
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

const tmpFile = (name: string, text: string): string => {
  const file = join(scratch, name);
  writeFileSync(file, text);
  return file;
};

describe("explicit dates", () => {
  it("keys entries by their index among all h2s, skipping fences and h3s", () => {
    const dates = devlogDates("tests/fixtures/dated-entries.md");
    expect(dates).toEqual(
      new Map([
        [1, "2026-01-05"],
        [3, "2026-02-10"],
      ])
    );
  });

  it("needs no git for an explicit date", () => {
    const file = tmpFile("untracked.md", "## [!log date:2026-03-03] Off the record\n");
    expect(devlogDates(file)).toEqual(new Map([[0, "2026-03-03"]]));
  });

  it("treats a malformed date option as absent", () => {
    // Falls back to history; untracked, so no date at all — a typo
    // never shows a broken date.
    const file = tmpFile("malformed.md", "## [!log date:03-03-2026] Wrong shape\n");
    expect(devlogDates(file)).toEqual(new Map());
  });
});

describe("dates from history", () => {
  it("dates a committed entry from the commit that added it — the shallow-clone canary", () => {
    const dates = devlogDates("tests/fixtures/git-dated.md");
    expect(dates.get(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("leaves an uncommitted entry undated", () => {
    const file = tmpFile("uncommitted.md", "## [!log] Not yet published\n");
    expect(devlogDates(file)).toEqual(new Map());
  });
});

describe("degenerate input", () => {
  it("returns an empty map for a missing file", () => {
    expect(devlogDates(join(scratch, "does-not-exist.md"))).toEqual(new Map());
  });
});
