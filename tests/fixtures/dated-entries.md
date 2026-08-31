# Devlog fixture — explicit dates and parsing edges

Test material for `devlog-dates`: entries carry explicit `date:`
options so no git history is needed. Keys are indices among ALL
h2s in document order — plain h2s count, fenced impostors and h3s
do not.

## Plain heading

An undated, unmarked heading — counts as h2 index 0.

## [!log date:2026-01-05] Dated entry

Index 1, explicit date.

```md
## [!log] Fenced impostor

Inside a fence this is code, not structure — skipped entirely.
```

### [!log] Not an h2

Depth three: not counted, not dated.

## Another plain heading

Index 2.

## [!log date:2026-02-10] Second dated entry

Index 3, explicit date.
