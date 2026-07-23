# yamf

SSR meta-framework on top of [Vite](https://vite.dev), [Nitro](https://nitro.build/), and [Hono JSX](https://hono.dev/docs/guides/jsx). File-based routing for HTML pages, islands architecture for client interactivity, client-side routing via [wouter](https://github.com/molefrog/wouter), React-ecosystem compatibility through [@hono/react-compat](https://github.com/honojs/react-compat), head/SEO via [unhead](https://unhead.unjs.io/), and full Nitro feature set (presets, caching, middleware, API routes).

## Install

```bash
npm install @pajecawav/yamf hono vite
# or
yarn add @pajecawav/yamf hono vite
# or
pnpm add @pajecawav/yamf hono vite
```

## Project structure

```
src/
  server.tsx              # server entry with export default defineServerEntry(...)
  client/index.ts         # client entry with import "@pajecawav/yamf/client"
  pages/*.page.tsx        # file-based routes (.page suffix required)
  root/index.tsx          # optional root layout
  template.html           # optional HTML shell with <!--ssr-outlet-->
  routes/                 # optional nitro API routes
vite.config.ts
```

## Vite plugin

```ts
// vite.config.ts
import yamf from "@pajecawav/yamf/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [yamf()],
});
```

## Server entry

```tsx
// src/server.tsx
import { defineServerEntry } from "@pajecawav/yamf/server";

export default defineServerEntry({
    head: {
        titleTemplate: "%s | my app",
        htmlAttrs: { lang: "en" },
    },
});
```

## Pages

```tsx
// src/pages/index.page.tsx
import { definePage } from "@pajecawav/yamf";

export default definePage({
    render: (event, { head }) => {
        head.push({ title: "Home" });

        return <h1>Hello, {event.url.hostname}!</h1>;
    },
});
```

### File routing

Files in `src/pages/` with `.page` suffix are mapped to routes following `nitro` conventions:

| File                      | Route           |
| ------------------------- | --------------- |
| `index.page.tsx`          | `/`             |
| `about.page.tsx`          | `/about`        |
| `[owner].page.tsx`        | `/:owner`       |
| `post/[postId].page.tsx`  | `/post/:postId` |
| `docs/[...rest].page.tsx` | `/docs/**`      |

### Redirects and non-HTML responses

```tsx
import { definePage } from "@pajecawav/yamf";
import { HTTPResponse, redirect } from "nitro/h3";

export default definePage({
    render: async () => {
        return redirect("/calc");

        // or

        return new HTTPResponse(null, {
            status: 302,
            headers: { location: "/calc" },
        });
    },
});
```

## Islands

Any file matching `*.island.{tsx,ts,jsx,js}` is automatically wrapped. Each exported function becomes an island that server-renders inside `<yamf-island>` and hydrates on the client.

```tsx
// src/components/Counter.island.tsx
import { type IslandProps, useHead } from "@pajecawav/yamf";
import { useState } from "hono/jsx";

export interface CounterProps extends IslandProps {
    initialValue?: number;
}

export const Counter = ({ initialValue = 0 }: CounterProps) => {
    const [value, setValue] = useState(initialValue);

    useHead({ title: `Counter: ${value}` });

    return <button onClick={() => setValue(value + 1)}>{value}</button>;
};
```

```tsx
// src/pages/index.page.tsx
import { Counter } from "~/components/Counter.island";

export default definePage({
    render: () => (
        <>
            <Counter initialValue={2} />
            <Counter initialValue={5} />
            <Counter yamf-client="visible" />
            <Counter yamf-client="skip" />
        </>
    ),
});
```

### Hydration directives

`yamf-client` prop controls when hydration happens:

| Value            | Behavior                            |
| ---------------- | ----------------------------------- |
| `load` (default) | Hydrate immediately on connection.  |
| `idle`           | Defer via `requestIdleCallback`.    |
| `visible`        | Hydrate when scrolled into view.    |
| `skip`           | Server-rendered only, no hydration. |

Props are serialized with `devalue` (supports `Date`, `Map`, `Set`, `URL`, `RegExp`, `Error`, `BigInt`, cycles).

### React ecosystem compatibility

The Vite plugin aliases `react` and `react-dom` to [`@hono/react-compat`](https://github.com/honojs/react-compat), which reimplements the React API on top of `hono/jsx`. This means libraries from the React ecosystem (wouter, tanstack/react-query, etc.) work inside islands and the render tree without shipping React. `use-sync-external-store` is also aliased to `@hono/react-compat`.

## Routing

Every page renders inside a [wouter](https://github.com/molefrog/wouter) `<Router>`, seeded with the current request's `pathname` and `search` for SSR. After hydration, navigation is client-side — wouter hooks and components work inside islands and the root layout:

```tsx
// src/components/Search.island.tsx
import { useSearchParams } from "wouter";

export const Search = () => {
    const [params, setParams] = useSearchParams();

    return (
        <input
            value={params.get("q") ?? ""}
            onChange={e =>
                setParams(prev => {
                    prev.set("q", e.target.value);
                    return prev;
                })
            }
        />
    );
};
```

wouter's `Link`, `Route`, `useLocation`, `useRoute`, and `useSearchParams` are all available. Note that yamf's file-based routing (see [File routing](#file-routing)) handles full-page SSR routes, while wouter handles client-side navigation and query-param state within a page.

## Client entry

```ts
// src/client/index.ts
import "@pajecawav/yamf/client";
```

Side-effect import. Registers the `yamf-island` custom element and initializes `window.__UNHEAD__`. Required for island hydration and client-side `useHead`.

## Head and SEO

```tsx
import { useHead, useSeoMeta } from "@pajecawav/yamf";

// In any component inside the render tree:
useHead({
    title: "Page title",
    meta: [{ name: "description", content: "..." }],
    link: [{ rel: "canonical", href: "https://..." }],
});

useSeoMeta({
    title: "Page title",
    ogTitle: "Page title",
    ogImage: "https://example.com/og.png",
});
```

In the `render` function itself, use the `head` argument directly (SSR context is not set up yet):

```tsx
export default definePage({
    render: (event, { head }) => {
        head.push({ title: "Page" });

        return <Content />;
    },
});
```

Default head from `defineServerEntry` is applied first, then page-specific head overrides individual fields.

## Root layout

```tsx
// src/root/index.tsx
import type { PropsWithChildren } from "hono/jsx";
import { useEvent } from "@pajecawav/yamf";
import "./index.css";

export default function Root({ children }: PropsWithChildren) {
    const event = useEvent();

    return (
        <>
            <nav>...</nav>
            <main>{children}</main>
        </>
    );
}
```

Optional. Wraps every page's content. CSS imported here is included in the asset manifest automatically. `useEvent()` works here because root renders inside the SSR context.

## HTML template

```html
<!-- src/template.html -->
<!doctype html>
<html>
    <head></head>
    <body>
        <!--ssr-outlet-->
    </body>
</html>
```

`<!--ssr-outlet-->` is replaced with rendered content. Head tags are injected by unhead. Falls back to a minimal default if the file is missing.

## Hooks

- `useEvent()` — current `H3Event`. Works in components inside the render tree and root layout, not in `render` itself.
- `useSSRContext()` — returns `{ head, event } | null`.
- `useHead(input)` — push head tags.
- `useSeoMeta(input)` — shorthand for SEO meta.

## API routes and error handling

Handled by Nitro directly. Place files in `src/routes/`:

```ts
// src/routes/api/badge.get.ts
import { defineHandler, getQuery, setHeader } from "nitro/h3";

export default defineHandler(event => {
    setHeader(event, "cache-control", "public, max-age=60");

    return "Cached response";
});
```

```ts
// src/error.ts
import { defineErrorHandler } from "nitro";

export default defineErrorHandler(error => {
    console.error(error);

    return new Response(`${error.statusCode} ${error.statusMessage}`);
});
```
