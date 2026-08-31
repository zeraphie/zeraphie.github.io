# Style Guide — izelya.me

The Astro + Lit-consumer adaptation of the hexpunk house style
(`hexpunk/.ai/STYLE.md` is the parent; where they disagree for
library code, hexpunk wins — this file governs site code).

## Principles

- Readability over cleverness; start simple, earn complexity.
- Split files early: ~250 lines look for a seam, ~400 finding one
  is a priority. Page scripts that outgrow their page move to
  `src/lib/`.
- Comments exist for exactly three reasons: intent of a file or
  function; reference for new maintainers; explaining genuinely
  complex code. Never narrate what the code says, never reference
  plans/ADRs from shipped text — the comment carries the
  reasoning itself.
- Comments are Plain English (the plainlanguage.gov / ISO 24495
  sense): common words, short declarative sentences, active
  voice. State the constraint or the reason and stop — no
  scene-setting, no flourish, no metaphor where a literal
  sentence does the job. One sentence is the default; a second
  earns its place by carrying a why.
- Domain vocabulary is not waffle — leaf, spread, spine, seed,
  bloom, dive are the system's real names; use them. The test is
  substitution: if a plainer word loses nothing, use it.
- Non-obvious modules open with an intent preamble: a Laravel-shape
  docblock (calebporzio.com/laravel-comments is the lineage — the
  tapered prose comes from there too) — bare `/**` opener, a
  `─ title ─` line, a blank gutter line, tapered prose, `*/` on its
  own line, max ~6 prose lines. CSS and Astro frontmatter use the
  same shape.
- `/**` above a declaration is that symbol's hover doc (JSDoc), and
  the nearest docblock wins — so a file's first declaration always
  keeps a docblock of its own, and a preamble never masquerades as
  hover docs. `//` is for inline comments only.
- Colours only via `--hp-*` tokens; no hardcoded palette values.
  Visual state is state-driven: CSS custom properties + attribute
  selectors, never inline `el.style.*` writes for visual state
  (geometry positioning is exempt, per hexpunk's applier
  pattern).
- No emoji in technical writing.

## Astro pages

- Page `<script>` blocks are modules that run once per load; keep
  page wiring idempotent and teardown-safe. If a client router
  lands later, wiring moves behind a per-visit helper (the
  showcase's `onPageVisit` pattern) — design for that now by
  avoiding module-scope element capture where practical.
- `<style is:global>` for anything that must reach runtime-created
  DOM — Astro's scoped styles only see server-rendered elements.

## Naming

| Thing                 | Convention                |
| --------------------- | ------------------------- |
| Files                 | `kebab-case`              |
| Variables / functions | `camelCase`               |
| Constants             | `SCREAMING_SNAKE_CASE`    |
| Git branches          | gitflow `type/short-desc` |

## Tests

- Runner: `bun test` (hexpunk's), layout: top-level `tests/` with
  `<domain>.test.ts` (snecko/wok's) — a deliberate hybrid: site
  logic is a handful of modules, so one directory reads better
  than hexpunk's collocation.
- Unit-test pure logic hard — the part that runs without a
  browser: remark transforms, path/world helpers, page math, data
  invariants.
- DOM-bound code is never DOM-emulated (a stub DOM measures
  nothing real, so its tests pass vacuously): extract the math
  into a pure module, test that, and verify real layout in the
  browser.
- Fixtures live in `tests/fixtures/`; a committed fixture whose
  date derives from git history doubles as the shallow-clone
  canary — it fails on a depth-1 clone by design.
- Snapshots are inline (`toMatchInlineSnapshot`) and small —
  snapshot the projection that is the contract (tree-shaped
  transforms like the remark plugin), never sprawling raw
  structures.
- A snapshot update is committed only after reading its diff; an
  unread update turns the test into a rubber stamp.
- Test behaviour, not implementation; names describe the
  scenario.

## Tooling

- `check` = format:check + lint + typecheck (`astro check`) +
  tests + a real build — the full gate runs every step.
- oxfmt formats code, not content: `src/content/` is excluded
  (`.prettierignore`) so ported posts stay byte-faithful.
- Bun only. The hexpunk dependency is trusted
  (`trustedDependencies`) so its `prepare` build runs on install.
