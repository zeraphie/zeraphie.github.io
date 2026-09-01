/**
 * ─ redirects tests — the migration's promise, enforced ─
 *
 * The left column was read off the live site's sitemap
 * (2026-08-31): lowercase, ampersand intact, no trailing slashes.
 * Every target must be a published page — a drafted target would
 * turn a redirect into a 404.
 */

import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

import config from "../astro.config.mjs";

const LIVE_TO_NEW: Record<string, string> = {
  "/d&d/aetherblade": "/dnd/aetherblade",
  "/d&d/home-rules": "/dnd/home-rules",
  "/d&d/merlins-claw": "/dnd/merlins-claw",
  "/d&d/oath-of-nihility": "/dnd/oath-of-nihility",
  "/d&d/sanguine-pact": "/dnd/sanguine-pact",
  "/personal-projects/password-gen": "/projects/password-gen",
  "/personal-projects/pjax": "/projects/pjax",
  "/personal-projects/discord-date-formatter": "/projects/discord-dates",
};

describe("the old-site redirects", () => {
  it("carry exactly the eight live URLs", () => {
    expect(config.redirects).toEqual(LIVE_TO_NEW);
  });

  it("point only at published pages", () => {
    for (const target of Object.values(LIVE_TO_NEW)) {
      const [, collection, id] = target.split("/");
      const file = `src/content/${collection}/${id}.md`;
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file, "utf8")).not.toMatch(/^draft:\s*true/m);
    }
  });
});
