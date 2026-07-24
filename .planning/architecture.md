# E2E Testing — Architecture & Setup

## Dependencies

### Install

```bash
pnpm add -D playwright
npx playwright install chromium  # download browser binary
```

`@playwright/test` is NOT needed — we use the `playwright` package directly with vitest.

### package.json additions

```json
{
    "devDependencies": {
        "playwright": "^1.x"
    },
    "scripts": {
        "test:e2e": "vitest run --config e2e/vitest.config.ts",
        "test:e2e:watch": "vitest watch --config e2e/vitest.config.ts"
    }
}
```

## Vitest configuration

`e2e/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Node environment — test code runs in Node, not browser
        environment: "node",
        // Global setup/teardown for server + browser lifecycle
        globalSetup: ["./setup/global-setup.ts"],
        // Test files
        include: ["e2e/**/*.spec.ts"],
        // Longer timeouts for e2e (server start, browser launch, page loads)
        testTimeout: 30_000,
        hookTimeout: 30_000,
        // Run sequentially — shared dev server, avoid port conflicts
        fileParallelism: false,
        // Don't fail if no tests in some files
        passWithNoTests: true,
    },
});
```

### Why `fileParallelism: false`?

All test files share a single dev server on a fixed port. Running files in parallel would require multiple servers or port management. Sequential file execution is simpler and sufficient for e2e tests.

Tests within a file CAN run in parallel (default), but we'll use `describe.sequential` where ordering matters.

## Global setup

`e2e/setup/global-setup.ts`:

Responsibilities:

1. Build the framework if `dist/` is missing or stale (`pnpm build`)
2. Start the playground dev server (`vite --port <port>`) as a child process
3. Wait for the server to be ready (poll `http://localhost:<port>/` until 200)
4. Launch a playwright chromium browser
5. Expose `baseURL`, `browser` via global variables or a shared module

```ts
// Pseudocode
export async function setup() {
    // 1. Build framework (if needed)
    await buildFramework();

    // 2. Start dev server
    const server = startDevServer(PORT);
    await waitForServer(`http://localhost:${PORT}/`);

    // 3. Launch browser
    const browser = await chromium.launch();

    // 4. Store for test access
    setGlobal({ baseURL: `http://localhost:${PORT}`, browser, server });

    return () => {
        await browser.close();
        await killServer(server);
    };
}
```

### Port management

Use a fixed port (e.g., `4321`) that's unlikely to conflict. If the port is in use, fail fast with a clear error.

Alternatively, use port `0` (random) and read the actual port from vite's output. This is more robust but harder to implement (need to parse stdout). For simplicity, use a fixed port.

### Framework build

The playground imports `@pajecawav/yamf/vite` which resolves to `dist/vite/index.mjs`. The framework must be built before the playground can start.

The global setup should run `pnpm build` if `dist/` doesn't exist. To avoid rebuilding on every run, check if `dist/` exists and skip if it does. For CI, the build step is already in the pipeline.

### Sharing state between setup and tests

Use a shared module that stores state:

```ts
// e2e/setup/state.ts
import type { Browser } from "playwright";

interface E2EState {
    baseURL: string;
    browser: Browser;
}

let state: E2EState | null = null;

export const setState = (s: E2EState) => {
    state = s;
};
export const getState = (): E2EState => {
    if (!state) throw new Error("E2E state not initialized");
    return state;
};
```

## Test fixtures

Each test file creates a fresh browser context + page in `beforeAll`/`afterAll`:

```ts
// e2e/helpers/fixtures.ts
let context: BrowserContext;
let page: Page;

beforeAll(async () => {
    const { browser } = getState();
    context = await browser.newContext();
    page = await context.newPage();
});

afterAll(async () => {
    await context.close();
});
```

A fresh context per test file ensures isolation (no shared cookies, localStorage, etc.).

## HTTP helpers

For SSR-level testing (raw HTML, headers, streaming):

```ts
// e2e/helpers/fetch.ts
export const fetchRaw = async (path: string): Promise<Response> => {
    return fetch(`${getState().baseURL}${path}`);
};

export const fetchHtml = async (path: string): Promise<string> => {
    const res = await fetchRaw(path);
    return res.text();
};
```

## Streaming helpers

For testing SSR streaming, we need to read the response body as a stream and observe chunks arriving over time:

```ts
// e2e/helpers/stream.ts
export const fetchStream = async (path: string) => {
    const res = await fetch(`${getState().baseURL}${path}`);
    const chunks: string[] = [];
    const reader = res.body!.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
    }

    return { status: res.status, headers: res.headers, chunks, full: chunks.join("") };
};
```

## Playground modifications

Add the following pages to the playground to cover missing test cases:

### 1. `playground/src/pages/islands.page.tsx` — All hydration directives + advanced props

```tsx
import { definePage } from "@pajecawav/yamf";
import { Counter } from "~/components/Counter.island";

export default definePage({
    render: () => (
        <>
            <Counter initialValue={1} data-testid="load" />
            <Counter initialValue={2} yamf-client="load" data-testid="load-explicit" />
            <Counter initialValue={3} yamf-client="idle" data-testid="idle" />
            <Counter initialValue={4} yamf-client="visible" data-testid="visible" />
            <Counter initialValue={5} yamf-client="skip" data-testid="skip" />
        </>
    ),
});
```

### 2. `playground/src/components/PropsDemo.island.tsx` — Advanced devalue props

An island that renders its props (Date, Map, Set, URL, RegExp, BigInt) to verify serialization round-trips correctly.

### 3. `playground/src/pages/params/[id].page.tsx` — Param routing

A page that reads a route param to verify file-based routing with params.

### 4. `playground/src/pages/head.page.tsx` — Head/SEO showcase

A page that exercises `useHead`, `useSeoMeta`, `head.push` with various meta tags.

## CI integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Install Playwright browsers
  run: npx playwright install chromium --with-deps

- name: Build framework
  run: pnpm build

- name: E2E tests
  run: pnpm test:e2e
```

The framework build is already in the CI pipeline. Playwright browser install is the only new step.
