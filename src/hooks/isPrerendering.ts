import { useSSRContext } from "#/context/ssr";

/**
 * Whether the current render runs inside Nitro's build-time prerender pass —
 * the prerenderer fetching the route to write it to disk as a static file.
 *
 * Always `false` in dev and at request time. Prefer this over
 * `import.meta.prerender`: pages are bundled by the vite ssr service, where
 * that flag is never replaced and would always read as `undefined`.
 */
export const isPrerendering = (): boolean => {
	return useSSRContext()?.event.req.headers.has("x-nitro-prerender") ?? false;
};
