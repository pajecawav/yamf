# Public API

## `@pajecawav/yamf`

- `definePage({ render, stream? })` — defines a page. Default export of `*.page.*` files.
- `useEvent()` — current `H3Event` from SSR context. For components inside the render tree / root layout.
- `useSSRContext()` — returns `{ head, event } | null`.
- `useHead(input)` — push head tags (title, meta, link, script, htmlAttrs, bodyAttrs).
- `useSeoMeta(input)` — shorthand for SEO meta (title, description, og:_, twitter:_).
- `Head` — component wrapper around `useHead`.

Types: `PageHandler`, `IslandClientDirective`, `IslandProps`, `YamfHead`, `ImportAssetsResult`, `ImportAssetsResultRaw`, `HeadProps`.

## `@pajecawav/yamf/vite`

- `yamf(options?)` — default export. `options.nitro` is passed to Nitro's vite plugin.

## `@pajecawav/yamf/server`

- `defineServerEntry({ head?, disableEarlyHints? })` — creates the Nitro handler. Default export of `src/server.tsx`.
- `createIsland(Component, exportName, assets)` — wraps a component as an island. Normally called by the babel transform, not directly.

## `@pajecawav/yamf/client`

Side-effect import. Registers `yamf-island` custom element and `window.__UNHEAD__`. No exports.

## Nitro utilities

Imported from `nitro` / `nitro/h3` / `nitro/cache` etc. — these are Nitro's, not yamf's. See Nitro docs. Common ones: `defineHandler`, `HTTPError`, `HTTPResponse`, `getQuery`, `getRouterParams`, `setHeader`, `withServerTiming`, `writeEarlyHints`, `defineCachedFunction`, `useStorage`, `useRuntimeConfig`.
