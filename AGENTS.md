# AGENTS.md

yamf — SSR meta-framework built on Vite + Nitro + Hono JSX.

## Documentation

- `.agents/api.md` — public API
- `.agents/architecture.md` — architecture

## Scripts

| Script                | Purpose                                               |
| --------------------- | ----------------------------------------------------- |
| `pnpm build`          | Build with `tsdown` (output in `dist/`)               |
| `pnpm dev`            | Build in watch mode                                   |
| `pnpm play`           | Playground in dev mode                                |
| `pnpm play:build`     | Build the playground                                  |
| `pnpm play:preview`   | Preview the built playground                          |
| `pnpm test`           | E2E tests via Playwright                              |
| `pnpm test:ui`        | Playwright UI                                         |
| `pnpm lint`           | oxlint + tsc + format --check + publint (in parallel) |
| `pnpm format`         | Format code (`pt format`, autofix)                    |
| `pnpm prepublishOnly` | Full check: build → lint:* → test                     |

Linting and formatting go through `@pajecawav/tools` (CLI `pt`).

## Mandatory checks after edits

After any code change, run:

1. `pnpm lint` — linters must pass clean.
2. `pnpm test` — tests must not fail.
3. `pnpm build` — if edits touch `src/` or build configs (`tsdown.config.ts`, `tsconfig*.json`).

On format errors: run `pnpm format` → repeat `pnpm lint`. Do not simplify or delete code to make checks pass — fix the root cause.

## Skills

- `.agents/skills/lint-build` — linting and build
- `.agents/skills/e2e-tests` — e2e tests
