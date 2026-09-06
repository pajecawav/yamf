# Public API

## `@pajecawav/yamf`

- `definePage({ render, stream?, cache?, params?, query? })` — defines a page. Default export of `*.page.*` files.
    - `stream: true` — flush the shell early and stream Suspense boundaries.
    - `cache: 60 | { maxAge, swr?, private? }` — sets the `Cache-Control` response header.
    - `params` / `query` — [standard-schema](https://standardschema.dev/) validators; invalid params → 404, invalid query → 400; validated values are passed to `render`.
- `safeAsync(Component, fallback?)` — wraps an async server component so a rejection after the streamed shell renders a fallback instead of an eternal loading state.
- `useEvent()` — current `H3Event` from SSR context. For components inside the render tree / root layout.
- `useSSRContext()` — returns `{ head, event } | null`.
- `useHead(input)` — push head tags (title, meta, link, script, htmlAttrs, bodyAttrs). Custom `seo` key is routed to `useSeoMeta`. On the client it is a lifecycle-bound hook (entry per component, patch on re-render, dispose on unmount) — call unconditionally.
- `useSeoMeta(input)` — shorthand for SEO meta (title, description, og:_, twitter:_). Same client lifecycle.
- `Head` — component wrapper around `useHead`.

Types: `PageHandler`, `PageRenderer<P, Q>`, `PageCacheOptions`, `IslandClientDirective`, `IslandProps`, `YamfHead`, `ImportAssetsResult`, `ImportAssetsResultRaw`, `HeadProps`, `StandardSchemaV1`, `Unhead`, `SafeAsyncFallbackProps`.

## `@pajecawav/yamf/vite`

- `yamf(options?)` — default export. `options.nitro` is passed to Nitro's vite plugin. Reserved nitro keys (`serverDir`, `renderer`, `compressPublicAssets`) are yamf-controlled; user `publicAssets` are merged with yamf's.

## `@pajecawav/yamf/server`

- `defineServerEntry({ head?, disableEarlyHints?, nonce? })` — creates the Nitro handler. Default export of `src/server.tsx`.
    - `nonce: string | ((event) => string)` — CSP nonce for yamf's inline scripts (head handshake payload, streamed head patches). Note: unhead's own bootstrap script does not support a nonce in unhead 3.x.
- `createIsland(Component, exportName, assets)` — wraps a component as an island. Normally called by the babel transform, not directly.

## `@pajecawav/yamf/client`

Side-effect import. Registers the `yamf-island` custom element via a tiny bootstrap; the full hydration runtime (hono/jsx dom, devalue, unhead client) is dynamically imported only when an island is present. Drains the unhead stream queue (`window.__unhead__`) into the client head — the server head handshake. No exports.

## Routing (wouter)

Every page renders inside a wouter `<Router ssrPath={pathname} ssrSearch={search}>`, so wouter hooks (`useSearchParams`, `useLocation`, `useRoute`) are available inside islands and the root layout. Navigation **between pages is always a full page load** — use plain `<a>` links; wouter `<Link>` inside an island desyncs the URL from the document. wouter is an optional peer dependency: declare it in the app's `package.json` to use it.

## React ecosystem compatibility

`react` / `react-dom` / `use-sync-external-store` are aliased to `@hono/react-compat` by the Vite plugin (peer dependency). React-ecosystem libraries work on top of `hono/jsx` without shipping React.

## Islands

Files matching `*.island.*` are transformed in the SSR environment. Exported function components are wrapped with `createIsland`. The transform warns on exports it cannot wrap (`export { … }`, re-exports, `export default <non-function>`, multi-declarator exports, non-component consts). `yamf-client` directives: `load` (default) / `idle` (with Safari `setTimeout` fallback) / `visible` / `skip` (no hydration — props are not serialized). Dev warning when serialized props exceed 16KB (`YAMF_ISLAND_PROPS_LIMIT`).

## Nitro utilities

Imported from `nitro` / `nitro/h3` / `nitro/cache` etc. — these are Nitro's, not yamf's. See Nitro docs. Common ones: `defineHandler`, `HTTPError`, `HTTPResponse`, `getQuery`, `getRouterParams`, `setHeader`, `withServerTiming`, `writeEarlyHints`, `defineCachedFunction`, `useStorage`, `useRuntimeConfig`.
