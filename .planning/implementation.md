# E2E Testing — Implementation Plan

## Execution order

Implementation is split into phases. Each phase produces a runnable, verifiable result.

---

## Phase 1: Infrastructure (prerequisites)

**Goal:** vitest + playwright installed, dev server starts, browser launches, first trivial test passes.

### 1.1 Install dependencies

```bash
pnpm add -D playwright
npx playwright install chromium
```

### 1.2 Create vitest config

- `e2e/vitest.config.ts` — Node env, global setup, sequential, 30s timeout

### 1.3 Create global setup/teardown

- `e2e/setup/global-setup.ts` — build framework, start dev server (port 4321), launch chromium
- `e2e/setup/global-teardown.ts` — close browser, kill server (returned from setup)
- `e2e/setup/state.ts` — shared state module (baseURL, browser)

### 1.4 Create helpers

- `e2e/helpers/fetch.ts` — `fetchRaw(path)`, `fetchHtml(path)`
- `e2e/helpers/fixtures.ts` — per-file context/page lifecycle

### 1.5 Smoke test

- `e2e/smoke.spec.ts` — GET `/` returns 200, contains `<!doctype html>`

### 1.6 Add npm scripts

- `"test:e2e": "vitest run --config e2e/vitest.config.ts"`
- `"test:e2e:watch": "vitest watch --config e2e/vitest.config.ts"`

### Verification

```bash
pnpm build && pnpm test:e2e
```

Smoke test passes.

---

## Phase 2: Playground fixtures (add missing test pages)

**Goal:** Playground covers all features listed in the test plan.

### 2.1 Islands directives page

- `playground/src/pages/islands.page.tsx` — all 4 directives + `data-testid` markers
- Reuse existing `Counter.island.tsx`

### 2.2 Advanced props island

- `playground/src/components/PropsDemo.island.tsx` — renders Date, Map, Set, URL, RegExp, BigInt
- `playground/src/pages/props.page.tsx` — uses PropsDemo with complex props

### 2.3 Param routing page

- `playground/src/pages/params/[id].page.tsx` — reads `id` param, displays it

### 2.4 Head showcase page (optional)

- `playground/src/pages/head.page.tsx` — exercises useHead, useSeoMeta, head.push with various tags
- Or rely on existing pages that already cover head functionality

### Verification

```bash
cd playground && npx vite --port 4321
# Manually verify /islands, /props, /params/123, /head render correctly
```

---

## Phase 3: Core SSR tests

**Goal:** All SSR and file-routing tests pass.

### 3.1 `e2e/ssr.spec.ts`

- Basic SSR rendering (200, text/html, content present)
- `event.url` access
- Root layout wrapping
- File routing (index, named, nested, params)
- 404 for unknown routes
- Non-streaming vs streaming content-type
- Multiple pages coexist

### Verification

```bash
pnpm test:e2e ssr
```

---

## Phase 4: Streaming tests

**Goal:** SSR streaming is verified at HTTP and browser level.

### 4.1 `e2e/streaming.spec.ts`

- Stream mode: chunked transfer encoding
- Suspense fallbacks in initial chunk
- Async content resolves in later chunks
- Browser renders final content

### 4.2 Create streaming helper

- `e2e/helpers/stream.ts` — read response body as stream, collect chunks

### Verification

```bash
pnpm test:e2e streaming
```

---

## Phase 5: Islands & hydration tests

**Goal:** All 4 hydration directives tested, props serialization verified.

### 5.1 `e2e/islands.spec.ts`

- `load` (default + explicit) — interactive after load
- `idle` — interactive after idle callback
- `visible` — interactive after scroll into view
- `skip` — never interactive
- Multiple islands independence
- Named vs default exports
- Props serialization (basic + advanced via devalue)
- `useHead` in islands (client-side title updates)
- `<yamf-island>` attributes verification

### Notes

- `idle` test: may need `page.evaluate(() => ...)` to trigger idle callback or wait
- `visible` test: may need `scrollIntoView()` or check if already visible
- `skip` test: verify no hydration by checking that clicks don't change state AND no island module is loaded

### Verification

```bash
pnpm test:e2e islands
```

---

## Phase 6: Head & metadata tests

### 6.1 `e2e/head.spec.ts`

- `head.push` in render
- `titleTemplate` from server entry
- `useHead` SSR + client-side updates
- `useSeoMeta`
- `bodyAttrs`
- `htmlAttrs`
- CSS/JS asset links in head
- Head priority/override

### Verification

```bash
pnpm test:e2e head
```

---

## Phase 7: CSS tests

### 7.1 `e2e/css.spec.ts`

- CSS modules scoped class names
- Computed styles (color, display, gap)
- Global CSS (body border)
- CSS link tags in head
- CSS files served correctly (200)

### Verification

```bash
pnpm test:e2e css
```

---

## Phase 8: wouter & React alias tests

### 8.1 `e2e/wouter.spec.ts`

- SSR routing context (initial URL)
- `useSearchParams` reads URL params
- Client-side search param updates
- react-query integration
- swr integration
- wouter imports work (react alias)

### Notes

- react-query/swr tests make real HTTP requests to jsonplaceholder API. Consider mocking or accepting network dependency. For e2e tests, real network is acceptable.
- These tests prove the `react` → `@hono/react-compat` and `use-sync-external-store` aliases work.

### Verification

```bash
pnpm test:e2e wouter
```

---

## Phase 9: Template tests

### 9.1 `e2e/template.spec.ts`

- Custom template used (marker `<p class="test">template</p>`)
- `<!--ssr-outlet-->` replaced
- Template structure preserved
- Applies to all pages

### Verification

```bash
pnpm test:e2e template
```

---

## Phase 10: Error handling, API routes, redirects

### 10.1 `e2e/errors.spec.ts`

- Custom error handler for thrown errors
- 404 handling
- Error response format

### 10.2 `e2e/api-routes.spec.ts`

- Basic API route
- API route with error
- API vs page content-type

### 10.3 `e2e/redirects.spec.ts`

- HTTPResponse redirect (302 + Location)
- Browser follows redirect

### Verification

```bash
pnpm test:e2e errors api-routes redirects
```

---

## Phase 11: CI integration & polish

### 11.1 Update CI workflow

- Add Playwright browser install step
- Add e2e test step (after build)

### 11.2 Update .gitignore

- Add `playwright-report/` if using traces
- Add `test-results/`

### 11.3 Update oxlint config

- Ensure `e2e/` is linted (remove from ignorePatterns if needed)

### 11.4 Full test run

```bash
pnpm build && pnpm test:e2e
```

### 11.5 Verify all tests pass

- Run full suite
- Check for flaky tests (streaming, idle, visible)
- Add retries for known flaky tests if needed

---

## Final file structure

```
e2e/
  vitest.config.ts
  setup/
    global-setup.ts
    global-teardown.ts        (or returned from global-setup)
    state.ts
  helpers/
    fetch.ts
    stream.ts
    fixtures.ts
  smoke.spec.ts
  ssr.spec.ts
  streaming.spec.ts
  islands.spec.ts
  head.spec.ts
  css.spec.ts
  wouter.spec.ts
  template.spec.ts
  errors.spec.ts
  api-routes.spec.ts
  redirects.spec.ts
```

## Playground additions

```
playground/src/
  pages/
    islands.page.tsx          # all hydration directives
    props.page.tsx            # advanced devalue props
    params/
      [id].page.tsx           # param routing
  components/
    PropsDemo.island.tsx      # renders complex props
```

## Risks & mitigations

| Risk                                   | Mitigation                                                      |
| -------------------------------------- | --------------------------------------------------------------- |
| Dev server startup is slow             | Poll with timeout, clear error on failure                       |
| Port conflict                          | Use uncommon port (4321), fail fast if in use                   |
| Streaming tests are flaky              | Use deterministic delays, generous timeouts                     |
| `idle` hydration hard to test          | Use `page.waitForFunction` with state check                     |
| `visible` hydration hard to test       | Scroll into view, wait for interactivity                        |
| react-query/swr depend on external API | Accept network dependency, or add a local API route as fallback |
| Framework not built                    | Global setup runs `pnpm build` if dist/ missing                 |
| Playwright browser not installed       | Document `npx playwright install chromium` in README            |
