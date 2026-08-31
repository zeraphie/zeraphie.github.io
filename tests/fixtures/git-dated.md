# Devlog fixture — the shallow-clone canary

## [!log] Dated by the commit that added this line

This entry has no explicit `date:` — its date is discovered from
git history: `git log -S` finds the commit that first added the
heading line above. Renaming that heading re-dates it (the
documented cost), so keep it stable.

On a depth-1 clone the lookup returns null and the test fails —
by design. This fixture guards the full-history checkout
(`fetch-depth: 0`) that devlog dating needs in CI.
