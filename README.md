# izelya.me

Izzy's personal site — an [hexpunk](https://github.com/zeraphie/hexpunk)
world where the homescreen is an hp-grid space: a seed hex that blooms
into categories, tether flights between them, and deep-dive reading.

**Status: local-only.** No remote, no deploys — the site iterates
locally until it is deliberately taken live.

## Develop

```sh
bun install
bun run dev      # dev server
bun run check    # format + lint + typecheck + tests + build
```

Or via [just](https://just.systems): `just dev`, `just check`.

## Structure

- `src/pages/index.astro` — the flow (the whole homescreen experience)
- `src/content/` — content collections (`dnd`, `projects`, `lyrics`,
  `guides`, `about`), schema in `src/content.config.ts`
- `.ai/` — workflow contract and style guide for AI collaborators
- `.plan/` — local-only ADRs and the roadmap (gitignored)

## Branching

Gitflow: `main` holds release states, `develop` is the integration
branch, `feature/*` branches hang off `develop`.
