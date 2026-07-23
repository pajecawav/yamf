# Architecture

yamf is a Vite plugin that wraps [Nitro](https://nitro.build/) and [Hono JSX](https://hono.dev/docs/guides/jsx). It does not ship a server — Nitro handles HTTP, assets, caching, and deployment presets. yamf adds file-based page routing, islands, and head/SEO on top.

## Layers

```
User project (src/pages/*.page.tsx, src/server.tsx, src/client/index.ts, src/root, src/template.html)
  │
  ▼
yamf Vite plugin (src/vite/index.ts)
  ├── yamf:config             — vite config for ssr/client environments, react → @hono/react-compat alias, noExternal: true
  ├── yamf:islands            — babel transform for *.island.* files (ssr env only)
  ├── yamf:islands:raw-import — post-transform: __island_raw_import__ → import
  ├── yamf:virtual-assets     — virtual:yamf:assets
  ├── yamf:virtual-pages      — virtual:yamf:pages
  ├── yamf:virtual-template   — virtual:yamf:template
  ├── yamf:virtual-root       — virtual:yamf:root
  └── nitro/vite              — Nitro (serverDir: ./src, renderer: false)
        │
        ▼
      Nitro runtime (h3 + rou3 + unstorage) → deploy target (node-server, vercel, ...)
```

## Hardcoded paths

Not configurable, resolved relative to project root:

| Path                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `./src/server.tsx`        | SSR entry, `export default defineServerEntry(...)` |
| `./src/client/index.ts`   | Client entry, must import `@pajecawav/yamf/client` |
| `./src/pages/**/*.page.*` | Page modules (`.page` suffix required)             |
| `./src/root`              | Optional root layout                               |
| `./src/template.html`     | Optional HTML shell with `<!--ssr-outlet-->`       |
| `./public/assets/`        | Static assets at `/assets/*`, 1-year max-age       |

API routes, middleware, error handlers under `./src/` are handled by Nitro's file scanner directly.

## Key source files

| File                        | What to look at there                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `src/vite/index.ts`         | Plugin composition, vite config, nitro options                                               |
| `src/vite/virtual-pages.ts` | Glob of `*.page.*` files                                                                     |
| `src/vite/islands.ts`       | Babel AST transform for islands (ssr env)                                                    |
| `src/server/entry.tsx`      | `defineServerEntry`, route registration, request flow                                        |
| `src/page.tsx`              | `definePage`, SSR render (stream/string), head injection, wraps content in wouter `<Router>` |
| `src/island/server.tsx`     | `createIsland` — server wrapper emitting `<yamf-island>`                                     |
| `src/island/client.tsx`     | `yamf-island` custom element, hydration directives                                           |
| `src/context/ssr.ts`        | SSR context (`head` + `event`)                                                               |
| `src/hooks/useHead.tsx`     | `useHead`/`useSeoMeta` — routes to SSR head or `window.__UNHEAD__`                           |

## Dependencies

- **nitro** (v3 beta) — server runtime, h3, rou3 router, asset manifests via `?assets=client`/`?assets=ssr`, deployment presets.
- **hono** — JSX renderer (`hono/jsx`, `hono/jsx/streaming`, `hono/jsx/dom/client`).
- **@hono/react-compat** (peer) — reimplementation of the React API on `hono/jsx`. Aliased from `react`, `react-dom`, and `use-sync-external-store` so React-ecosystem libraries work without React.
- **wouter** — client-side router. `definePage` wraps page content in `<Router ssrPath ssrSearch>`, making routing hooks available in islands and root layout.
- **unhead** (v3) — head/SEO, streaming support via `createStreamableHead` / `wrapStream`.
- **devalue** — prop serialization for islands.
- **rou3** — route matching (used in `defineServerEntry`).
- **ufo** — URL utilities.
- **@babel/parser, @babel/traverse, @babel/generator, @babel/types** — island AST transform.
- **exsolve** — resolving `src/root` module path.

## Islands

Files matching `*.island.{tsx,ts,jsx,js,...}` are transformed by `yamf:islands` in the SSR environment only. Each exported function is wrapped with `createIsland` (from `src/island/server.tsx`), which renders a `<yamf-island>` custom element with serialized props and asset URLs. The client runtime (`src/island/client.tsx`) hydrates based on the `yamf-client` directive (`load` / `idle` / `visible` / `skip`).

## Deployment

Via Nitro presets: `yamf({ nitro: { preset: "vercel" } })`. Output is `.output/server/index.mjs` (node-server) or platform-specific. For Vercel: `vercel.json` with `{ "framework": "nitro" }`.
