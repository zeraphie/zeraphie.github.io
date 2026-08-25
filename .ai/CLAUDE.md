# izelya.me — CLAUDE.md

Izzy's personal site: the hp-grid spatial world IS the site, not
decoration on pages. Astro 6 + Bun, consuming hexpunk
(`@hexpunk/core`) as a git dependency pinned to a tag/SHA — this
repo is hexpunk's second consumer and its dogfooding pressure.
Deploys to GitHub Pages from Actions at https://izelya.me.

## Workflow

Research → design doc → plan → execute, step by step.

1. Substantial work starts as research/discussion and lands in
   `.plan/PLAN.site-redesign.md` (the ADR carried over from the
   pre-repo era; local-only, gitignored).
2. Plans derive from it as checkbox steps. Execute one step at a
   time. After each step: run `bun run check`, commit, **explain
   what was implemented, how it works, and why this approach over
   alternatives**, then stop and wait for review.
3. Never auto-advance. Commit when a step lands or when asked;
   never push unprompted.
4. Open design decisions are surfaced as questions with options —
   never "I'd lean toward X" and ship.

## House rules

- Bun only — `bun add` / `bun run`; never npm or yarn.
- hexpunk work is punch-list only: if a page needs a missing or
  wip hexpunk capability, flag it as a hexpunk revisit (in
  hexpunk's own `.plan/`) rather than working around it here.
  Local iteration against the sibling checkout may bun-link it
  (never committed); the committed pin is always a tag or SHA.
- Lit elements are client-only custom elements in Astro templates
  (no SSR'd shadow DOM); wip elements import from
  `@hexpunk/core/wip` — instability is opted into by name.
- Commits: `type(scope): short description`, subject-only, no
  trailers.

## Key paths

- `.plan/` — local-only ADR + roadmap (gitignored)
- `src/pages/` — routes; `index.astro` is the flow (seed → bloom
  → flight → dive → track)
- `public/fonts/` — self-hosted faces vendored from hexpunk's
  assets; regenerate from hexpunk when they change
- `.github/workflows/deploy.yml` — build + Pages deploy
