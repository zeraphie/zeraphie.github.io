# justfile — task runner
# https://just.systems

set shell := ["sh", "-c"]

# List all available recipes
default:
    @just --list

# ── Dependencies ───────────────────────────────────────────────────────────────

# Install dependencies
install:
    bun install

# ── Development ────────────────────────────────────────────────────────────────

# Start the development server
dev:
    bun run dev

# Build for production
build:
    bun run build

# Preview the production build
preview:
    bun run preview

# ── Quality ────────────────────────────────────────────────────────────────────

# Typecheck via astro check
typecheck:
    bun run typecheck

# Run tests once
test:
    bun run test

# Lint source files
lint:
    bun run lint

# Lint source files and auto-fix where possible
lint-fix:
    bun run lint:fix

# Format all files in place
format:
    bun run format

# Check formatting without writing changes
format-check:
    bun run format:check

# ── Changelog ──────────────────────────────────────────────────────────────────

# Remind to update CHANGELOG.md before releasing
changelog:
    @echo "──────────────────────────────────────────────────"
    @echo "  Please update CHANGELOG.md before releasing."
    @echo "  Move items from [Unreleased] to a new version"
    @echo "  section, e.g. [1.2.0] - $(date +%Y-%m-%d)"
    @echo "  Entries should describe behaviour, not files."
    @echo "──────────────────────────────────────────────────"

# ── Composite ──────────────────────────────────────────────────────────────────

# Full gate: format check, lint, typecheck, tests, build
check:
    bun run check

# CI pipeline — frozen install then full check
ci:
    bun install --frozen-lockfile
    just check
