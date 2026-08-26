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
- Non-obvious modules open with an intent preamble (box-drawing
  title rule, tapered prose, max ~6 lines).
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

## Tooling

- `check` = format:check + lint + typecheck (`astro check`) +
  tests + a real build — the full gate runs every step.
- oxfmt formats code, not content: `src/content/` is excluded
  (`.prettierignore`) so ported posts stay byte-faithful.
- Bun only. The hexpunk dependency is trusted
  (`trustedDependencies`) so its `prepare` build runs on install.
