# E2E Testing — Detailed Test Cases

Each test file targets a specific feature area. Tests use a combination of:

- **HTTP fetch** — raw SSR response assertions (status, headers, HTML content)
- **Playwright page** — browser assertions (DOM, computed styles, interactivity, client-side JS)

Convention: `data-testid` attributes on key elements for stable selectors.

---

## 1. SSR (`ssr.spec.ts`)

### 1.1 Basic SSR rendering

- **Test:** GET `/` returns 200 with `text/html; charset=utf-8`
- **Test:** HTML contains server-rendered content (Counter buttons with initial values)
- **Test:** HTML contains `<yamf-island>` custom elements with correct attributes
- **Test:** Content is visible before any JS executes (use page with JS disabled, or check raw HTML)

### 1.2 `event.url` access

- **Test:** `/` page contains `URL: http://localhost:<port>/`
- **Test:** `/calc` page contains `URL: http://localhost:<port>/calc`

### 1.3 Root layout

- **Test:** All pages are wrapped in root layout (`<div class="_layout_...">`)
- **Test:** Root layout CSS module class is applied

### 1.4 File routing

- **Test:** `index.page.tsx` → `/` (home page)
- **Test:** `calc.page.tsx` → `/calc`
- **Test:** `wouter/index.page.tsx` → `/wouter`
- **Test:** `[id].page.tsx` → `/:id` (param extracted correctly)
- **Test:** Unknown route `/nonexistent` → 404

### 1.5 Non-streaming response

- **Test:** `/calc` (no `stream: true`) returns complete HTML in a single response
- **Test:** Response is NOT chunked (no `Transfer-Encoding: chunked` or content arrives all at once)

### 1.6 Content-Type and headers

- **Test:** All HTML pages return `Content-Type: text/html; charset=utf-8`
- **Test:** API route `/hello` returns `text/plain` (or `text/plain;charset=utf-8`)

### 1.7 Multiple pages coexist

- **Test:** Navigate between `/`, `/calc`, `/wouter` — each renders correct content

---

## 2. SSR Streaming (`streaming.spec.ts`)

### 2.1 Stream mode enabled

- **Test:** `/` page (has `stream: true`) returns `Transfer-Encoding: chunked`
- **Test:** Response body arrives in multiple chunks (not all at once)

### 2.2 Suspense fallbacks

- **Test:** Initial HTML chunk contains `<span>Loading...</span>` (Suspense fallback)
- **Test:** Initial HTML contains `<template id="H:0">` markers (hono suspense boundaries)

### 2.3 Async content resolves

- **Test:** After waiting, later chunks contain the resolved AsyncCounter content
- **Test:** Final assembled HTML contains all counter buttons (values 3 and 7)
- **Test:** The `<template>` suspense markers are replaced with actual content

### 2.4 Streaming script injection

- **Test:** Stream contains `<script>` blocks that replace suspense templates
- **Test:** Scripts reference correct `data-hono-target` IDs

### 2.5 Browser renders stream correctly

- **Test:** After page load completes, both AsyncCounter components are visible
- **Test:** AsyncCounter values (3 and 7) are rendered in the DOM

---

## 3. Islands & Hydration (`islands.spec.ts`)

### 3.1 Default hydration (`load`)

- **Test:** `/islands` page renders island with `data-testid="load"`
- **Test:** Button shows initial value (1)
- **Test:** After page load, clicking the button increments the value (1 → 2 → 3)
- **Test:** Island is interactive (onClick handler works)

### 3.2 Explicit `load` directive

- **Test:** `data-testid="load-explicit"` island hydrates and is interactive
- **Test:** Same behavior as default

### 3.3 `idle` directive

- **Test:** `data-testid="idle"` island renders SSR content (value 3)
- **Test:** Island is NOT immediately interactive after load
- **Test:** After `requestIdleCallback` fires, island becomes interactive
- **Test:** Clicking after idle hydration increments value (3 → 4)

### 3.4 `visible` directive

- **Test:** `data-testid="visible"` island renders SSR content (value 4)
- **Test:** Island is NOT interactive until scrolled into view
- **Test:** After scrolling into view (or if already visible), island hydrates
- **Test:** After hydration, clicking increments value (4 → 5)

### 3.5 `skip` directive

- **Test:** `data-testid="skip"` island renders SSR content (value 5)
- **Test:** Island has `island-client="skip"` attribute on `<yamf-island>`
- **Test:** Island is NEVER interactive — clicking does nothing
- **Test:** No hydration script/module is loaded for this island

### 3.6 Multiple islands on same page

- **Test:** `/` page has 3 counter islands (Counter, Doubler, Tripler)
- **Test:** Each island hydrates independently
- **Test:** Counter increments by 1, Doubler doubles, Tripler triples
- **Test:** Interacting with one island doesn't affect others

### 3.7 Named exports vs default export

- **Test:** Named export island (Counter, Doubler, Tripler) — `island-entry` attribute matches export name
- **Test:** Default export island (Calc) — `island-entry` attribute is `"default"`
- **Test:** Both types hydrate and are interactive

### 3.8 Props serialization

- **Test:** `initialValue` (number) is correctly serialized and available on client
- **Test:** Boolean props (`withTitle`) serialize correctly
- **Test:** Advanced props (Date, Map, Set, URL, RegExp, BigInt) round-trip correctly
- **Test:** PropsDemo island renders serialized values matching input

### 3.9 `useHead` in islands (client-side)

- **Test:** Calc island updates `<title>` when input values change
- **Test:** Counter with `withTitle` updates `<title>` on click
- **Test:** Title reflects current state (`Counter: 5`)

### 3.10 Island custom element attributes

- **Test:** `<yamf-island>` has `island-src` pointing to island module
- **Test:** `<yamf-island>` has `island-entry` matching export name
- **Test:** `<yamf-island>` has `island-props` with devalue-serialized props
- **Test:** `<yamf-island>` has `island-client` directive when specified
- **Test:** `<yamf-island>` has `style="display:contents"`

---

## 4. Head & Metadata (`head.spec.ts`)

### 4.1 `head.push` in render function

- **Test:** `/` page has `<title>YAMF Playground | playground</title>` (title + titleTemplate)
- **Test:** `/calc` page has `<title>2 * 7 = 14 | playground</title>` (dynamic title from island useHead)

### 4.2 `titleTemplate` from server entry

- **Test:** All pages have `| playground` suffix in title
- **Test:** titleTemplate `%s` is replaced with page-specific title

### 4.3 `useHead` in islands (SSR)

- **Test:** Calc island's `useHead({ title: ... })` appears in SSR HTML `<title>`

### 4.4 `useHead` in islands (client-side update)

- **Test:** After changing Calc inputs, `<title>` updates to reflect new calculation
- **Test:** After clicking Counter (withTitle), `<title>` updates to `Counter: N`

### 4.5 `useSeoMeta` from server entry

- **Test:** All pages have `<meta name="description" content="hello world">`
- **Test:** SEO meta from server entry applies to all pages

### 4.6 `bodyAttrs`

- **Test:** `/` page `<body>` has `class="tteesstt"`
- **Test:** `/calc` page `<body>` does NOT have the test class (page-specific)

### 4.7 `htmlAttrs`

- **Test:** `<html>` has `lang="en"` (from server entry, if configured)

### 4.8 CSS/JS asset links in head

- **Test:** `<head>` contains `<link rel="stylesheet">` for CSS modules
- **Test:** `<head>` contains `<script type="module">` for client entry
- **Test:** `<head>` contains `<link rel="modulepreload">` for JS chunks (in production)

### 4.9 Head priority / override

- **Test:** Page-specific head overrides server entry defaults
- **Test:** Island `useHead` title overrides page `head.push` title

---

## 5. CSS Styles (`css.spec.ts`)

### 5.1 CSS Modules — scoped class names

- **Test:** Counter buttons have scoped class (e.g., `_counter_vlmb7_1`)
- **Test:** Container has scoped class (e.g., `_container_uh82g_1`)
- **Test:** Root layout has scoped class

### 5.2 CSS Modules — styles applied

- **Test:** Counter button computed `color` is `rgb(0, 0, 255)` (blue)
- **Test:** Container computed `display` is `flex`
- **Test:** Container computed `gap` is `16px`

### 5.3 Global CSS

- **Test:** `body` has `border: 5px solid red` (from `root/index.css`)
- **Test:** Global CSS is loaded via `<link>` in head

### 5.4 CSS link tags in head

- **Test:** `<head>` has `<link rel="stylesheet">` for `Root.module.css`
- **Test:** `<head>` has `<link rel="stylesheet">` for `index.css`
- **Test:** `<head>` has `<link rel="stylesheet">` for `Counter.module.css`
- **Test:** `<head>` has `<link rel="stylesheet">` for `Container.module.css`
- **Test:** CSS link `href` points to valid resources (200 when fetched)

### 5.5 Styles work in dev mode

- **Test:** CSS files are served by vite dev server (not pre-built)
- **Test:** `data-vite-dev-id` attribute present on CSS links in dev

---

## 6. wouter & React Alias (`wouter.spec.ts`)

### 6.1 SSR routing context

- **Test:** `/wouter` page SSR-renders with correct initial URL
- **Test:** `useSearchParams` returns empty params on initial `/wouter` load

### 6.2 `useSearchParams` in islands

- **Test:** Navigate to `/wouter?q=test&v=42`
- **Test:** Input `q` has value `test`
- **Test:** Input `v` has value `42`

### 6.3 Client-side search param updates

- **Test:** Type in `q` input → URL updates with `?q=...`
- **Test:** Type in `v` input → URL updates with `?v=...`
- **Test:** Browser back/forward updates inputs (if wouter supports it)

### 6.4 React alias — react-query

- **Test:** `/query` page renders `loading...` initially (SSR)
- **Test:** After hydration + fetch, data from jsonplaceholder API appears
- **Test:** react-query works (proves `react` → `@hono/react-compat` alias)

### 6.5 React alias — swr

- **Test:** `/swr` page renders `loading...` initially (SSR)
- **Test:** After hydration + fetch, data appears
- **Test:** swr works (proves `use-sync-external-store` alias)

### 6.6 React alias — wouter itself

- **Test:** wouter imports work (it imports from `react` internally)
- **Test:** `useSearchParams` hook works in island context

---

## 7. template.html (`template.spec.ts`)

### 7.1 Custom template used

- **Test:** HTML output contains `<p class="test">template</p>` (from template.html)
- **Test:** Template content appears before SSR outlet content

### 7.2 `<!--ssr-outlet-->` replaced

- **Test:** Output does NOT contain `<!--ssr-outlet-->`
- **Test:** Output contains rendered page content where outlet was

### 7.3 Template structure preserved

- **Test:** Output starts with `<!doctype html>`
- **Test:** Output has `<html>`, `<head>`, `<body>` structure from template
- **Test:** Head tags injected by unhead appear inside `<head>`

### 7.4 Template applies to all pages

- **Test:** `/` has template marker
- **Test:** `/calc` has template marker
- **Test:** All pages use same template structure

---

## 8. Error Handling (`errors.spec.ts`)

### 8.1 Custom error handler — thrown error

- **Test:** GET `/error` returns 500
- **Test:** Response body matches custom handler format: `500 Something went wrong`
- **Test:** Custom handler is invoked (not nitro default JSON error)

### 8.2 404 handling

- **Test:** GET `/nonexistent` returns 404
- **Test:** Response is an error response (not a valid HTML page)
- **Test:** Response body contains error information

### 8.3 Error in page render

- **Test:** A page that throws during render triggers error handler
- **Test:** Error handler receives the error with correct status

### 8.4 Error handler response format

- **Test:** Error handler returns `Response` object
- **Test:** Response uses `error.status` and `error.statusText`
- **Test:** Falls back to "Something went wrong" when statusText is missing

---

## 9. API Routes (`api-routes.spec.ts`)

### 9.1 Basic API route

- **Test:** GET `/hello` returns 200
- **Test:** Response body is `hello`
- **Test:** Content-Type is `text/plain` (or similar)

### 9.2 API route with error

- **Test:** GET `/error` (API route that throws) returns 500
- **Test:** Error is caught by custom error handler

### 9.3 API vs page routes

- **Test:** API routes don't render HTML
- **Test:** Page routes return `text/html`

---

## 10. Redirects (`redirects.spec.ts`)

### 10.1 HTTPResponse redirect

- **Test:** GET `/redirect` returns 302
- **Test:** Response has `Location: /calc` header
- **Test:** Following the redirect lands on `/calc`

### 10.2 Browser follows redirect

- **Test:** Navigate to `/redirect` in browser → lands on `/calc`
- **Test:** URL bar shows `/calc` after redirect
- **Test:** Calc page content is rendered

---

## 11. Early Hints (optional / `early-hints.spec.ts`)

### 11.1 Early hints sent

- **Test:** Response includes 103 Early Hints (may be dev-mode dependent)
- **Test:** Early hints contain `Link:` headers for CSS/JS assets
- **Test:** `modulepreload` for JS, `preload; as=style` for CSS

> Note: Early hints may behave differently in dev vs production. This test may need to be conditional or skipped in dev mode.

---

## Test execution matrix

| Test file             | HTTP fetch                 | Playwright browser         | Notes           |
| --------------------- | -------------------------- | -------------------------- | --------------- |
| `ssr.spec.ts`         | ✅ Primary                 | ✅ For no-JS verification  |                 |
| `streaming.spec.ts`   | ✅ Primary (chunk reading) | ✅ For final render        |                 |
| `islands.spec.ts`     | ✅ For SSR attributes      | ✅ Primary (interactivity) |                 |
| `head.spec.ts`        | ✅ For SSR head            | ✅ For client-side updates |                 |
| `css.spec.ts`         | ✅ For link tags           | ✅ For computed styles     |                 |
| `wouter.spec.ts`      | ✅ For SSR params          | ✅ Primary (navigation)    |                 |
| `template.spec.ts`    | ✅ Primary                 |                            |                 |
| `errors.spec.ts`      | ✅ Primary                 |                            |                 |
| `api-routes.spec.ts`  | ✅ Primary                 |                            |                 |
| `redirects.spec.ts`   | ✅ Primary                 | ✅ For browser redirect    |                 |
| `early-hints.spec.ts` | ✅ Primary                 |                            | May skip in dev |
