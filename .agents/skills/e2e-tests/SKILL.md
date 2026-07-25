---
name: e2e-tests
description: Runs the yamf e2e tests via Playwright. Use after code edits and before committing to check for regressions.
---

# E2E tests

Tests are e2e with Playwright, located in `e2e/`. Config is `playwright.config.ts`.

## Commands

- `pnpm test` — run all tests (headless)
- `pnpm test:ui` — interactive Playwright UI for debugging

## Procedure

1. Run `pnpm test`.
2. On failures — inspect the trace/report in `playwright-report/` and `test-results/`.
3. Fix the root cause of the failure; do not mute or skip tests.
4. After a fix, repeat `pnpm test` until green.

## Full pre-publish check

`pnpm prepublishOnly` runs build → `lint:*` → test. Use it as the final check.
