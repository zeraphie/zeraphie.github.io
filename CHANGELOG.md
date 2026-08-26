# Changelog

All notable changes to this project will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **The flow** — the homescreen as an hp-grid world: seed ignition arrival,
  hover-bloomed sections, tether flights to categories, deep-dive reading
  view, hextrack rail. Hash routes (`#/cat/item/heading`) with instant
  deep-link restore.
- **Content collections** — all zeraphie-site posts ported with schema
  validation: `dnd` and `projects` published sets plus drafts (`lyrics`,
  `guides`, `about`, unpublished projects) carrying the old
  `published: false` as `draft: true`.
- **House repo pattern** — oxfmt/oxlint configs, justfile, CI workflow
  (install → check/build, lint, format, test; deliberately no deploy),
  `.nvmrc` (lts/krypton), this changelog.

### Changed

- **Astro 5 → 7, everything current** — astro ^7.2.7, @astrojs/check
  ^0.9.10, typescript ^6.0.3 (TS 7 waits on @astrojs/check's peer range).
  Unblocked by the system Node upgrade to 24 LTS.
