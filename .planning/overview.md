# E2E Testing — Overview

## Goal

Create comprehensive end-to-end tests for the yamf SSR meta-framework using **Playwright** (`@playwright/test`). All tests live in `e2e/` at the project root.

## What yamf is

yamf is an SSR meta-framework built on:

- **Vite** — dev server, build, HMR
- **Nitro** — server runtime, file-based API routes, error handling, presets
- **Hono JSX** — server-side rendering, streaming
- **wouter** — client-side routing (seeded with SSR path)
- **@hono/react-compat** — React ecosystem compat (react/react-dom aliased to it)
- **unhead** — head/SEO management
- **devalue** — island props serialization (Date, Map, Set, URL, RegExp, Error, BigInt, cycles)

## Tool decision: @playwright/test

**Chosen approach:** `@playwright/test` — Playwright's built-in test runner.

### Why Playwright's test runner?

- **Built-in `webServer` config** — starts the dev server, waits for it, tears it down automatically. No custom global setup needed for server lifecycle.
- **`page` fixture** — browser automation with auto-waiting assertions, no manual browser lifecycle.
- **`request` fixture** — HTTP-level testing (status codes, headers, API routes, redirects).
- **Parallel execution** — tests run in parallel across browser contexts automatically.
- **Idiomatic selectors** — `page.locator()`, `getByTestId()`, `getByText()` instead of regex on raw HTML.

### Dependencies

| Package            | Type          | Purpose                                             |
| ------------------ | ------------- | --------------------------------------------------- |
| `@playwright/test` | devDependency | Test runner + browser automation + HTTP request API |

## Test subject: the playground app

The `playground/` workspace package is a full yamf app that exercises most features. Additional test-specific pages were added for coverage:

| Feature                          | Playground coverage                                       |
| -------------------------------- | --------------------------------------------------------- |
| Basic SSR                        | ✅ All pages (`/`, `/calc`, `/wouter`, `/query`, `/swr`)  |
| Streaming                        | ✅ `/streaming` (200-400ms delays) + `/` (longer delays)  |
| Islands (load/idle/visible/skip) | ✅ `/islands` page with all 4 directives                  |
| Advanced props (devalue)         | ✅ `/props` page with Date, Map, Set, URL, RegExp, BigInt |
| useHead (SSR + client)           | ✅ Calc island + Counter with withTitle                   |
| useSeoMeta                       | ✅ In server entry                                        |
| head.push                        | ✅ On `/` and `/calc`                                     |
| titleTemplate                    | ✅ In server entry                                        |
| bodyAttrs                        | ✅ On `/`                                                 |
| CSS modules                      | ✅ Counter, Container, Root                               |
| Global CSS                       | ✅ Root `index.css`                                       |
| wouter                           | ✅ `/wouter` with useSearchParams                         |
| react-query                      | ✅ `/query`                                               |
| swr                              | ✅ `/swr`                                                 |
| template.html                    | ✅ Custom template with marker                            |
| Error handler                    | ✅ `/error` route + custom handler                        |
| API routes                       | ✅ `/hello`                                               |
| Redirects                        | ✅ `/redirect`                                            |
| File routing (params)            | ✅ `/params/[id]`                                         |

## Server lifecycle

```
webServer config (Playwright built-in):
  1. Runs `npx vite --port 4321 --strictPort` in playground/
  2. Polls http://localhost:4321 until ready
  3. Reuses existing server if already running (reuseExistingServer: true)

globalSetup:
  1. Builds the framework (pnpm build) if dist/ is missing

Tests run in parallel:
  - page fixture: browser automation (goto, locator, click, expect)
  - request fixture: HTTP-level testing (get, status, headers, text)

Teardown:
  - Playwright kills the dev server automatically
```

## File structure

```
e2e/
  playwright.config.ts       # Playwright config (webServer, baseURL, timeout)
  setup/
    global-setup.ts          # Build framework if dist/ missing
  smoke.spec.ts              # Smoke test
  ssr.spec.ts                # SSR rendering, file routing
  streaming.spec.ts          # SSR streaming, Suspense
  islands.spec.ts            # Islands, hydration directives, props
  head.spec.ts               # Head/SEO metadata
  css.spec.ts                # CSS modules, global CSS, computed styles
  wouter.spec.ts             # wouter, react-query, swr (react alias)
  template.spec.ts           # template.html
  errors.spec.ts             # Error handling
  api-routes.spec.ts         # API routes
  redirects.spec.ts          # Redirects
```
