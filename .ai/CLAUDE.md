# izelya.me — CLAUDE.md

Izzy's personal site: the hp-grid spatial world IS the site, not
decoration on pages. Astro 7 + Bun, consuming hexpunk
(`@hexpunk/core`) as a git dependency pinned to a release tag —
this repo is hexpunk's second consumer and its dogfooding
pressure. **Local-only:** no remote, no deploys; the site
iterates locally and goes live only when Izzy explicitly says so
— never create a GitHub repo, push, or configure any deployment
unprompted.

## Workflow

Research → design doc → plan → execute, step by step.

1. Substantial work starts as research/discussion and lands in a
   `.plan/` ADR (local-only, gitignored): `PLAN.site-redesign.md`
   is the site roadmap, `PLAN.<topic>.md` per focused rework
   (e.g. `PLAN.longform-journal.md`).
2. Plans derive from those as checkbox steps. Execute one step at
   a time. After each step: run `bun run check`, commit,
   **explain what was implemented, how it works, and why this
   approach over alternatives**, then stop and wait for review.
3. Never auto-advance. Commit when a step lands or when asked;
   never push unprompted.
4. Open design decisions are surfaced as questions with options —
   never "I'd lean toward X" and ship.

## Style

See [STYLE.md](STYLE.md). Formatting is oxfmt's job, linting is
oxlint's — style review is about what tools can't check.

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
- Content collections are the content source of truth; ported
  posts stay byte-faithful (oxfmt ignores `src/content/`).
- Commits: `type(scope): short description`, subject-only, no
  trailers.

## Key paths

- `.plan/` — local-only ADRs + roadmap (gitignored)
- `src/pages/` — routes; `index.astro` is the flow (seed → bloom
  → flight → dive → track)
- `src/content/` — content collections (`dnd`, `projects`,
  `lyrics`, `guides`, `about`); schema in `src/content.config.ts`
- `public/fonts/` — self-hosted faces vendored from hexpunk's
  assets; regenerate from hexpunk when they change
- `.github/workflows/ci.yml` — checks only; deploy is added
  deliberately at go-live, never before
