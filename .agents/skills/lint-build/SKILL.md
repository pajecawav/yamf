---
name: lint-build
description: Runs the linters (oxlint, tsc, format check, publint) and the build of yamf. Use after code edits to verify quality and buildability, before committing.
---

# Linting and build

The yamf project uses `@pajecawav/tools` (CLI `pt`) for formatting and `oxlint` for static analysis.

## Commands

- `pnpm lint` — runs `lint:oxlint`, `lint:tsc`, `lint:format`, `lint:package` in parallel
- `pnpm build` — build with `tsdown`, output in `dist/`
- `pnpm format` — autofix formatting (`pt format`)

## Verification procedure

1. Run `pnpm lint`. All four subtasks must pass without errors.
2. Run `pnpm build` if edits touch `src/` or build configs (`tsdown.config.ts`, `tsconfig*.json`).
3. On format errors — run `pnpm format` and repeat `pnpm lint`.
4. Do not simplify or delete code to make the linter pass — fix the root cause.

## What each linter checks

- `oxlint .` — static analysis, config in `oxlint.config.ts`
- `tsc -b --noEmit` — type checking, configs in `tsconfig*.json`
- `pt format --check` — format check, config in `oxfmt.config.ts`
- `publint` — validates `package.json` and the `exports` field

## Full pre-publish check

`pnpm prepublishOnly` runs build → `lint:*` → test. Use it as the final check.
