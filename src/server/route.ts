import path from "node:path";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";

/**
 * Converts a pages-file path into a rou3 route pattern, following nitro
 * conventions:
 *
 * - `src/pages/index.page.tsx` → `/`
 * - `src/pages/about.page.tsx` → `/about`
 * - `src/pages/[owner].page.tsx` → `/:owner` (non-word chars in the name
 *   are sanitized: `[my-id]` → `:my_id`)
 * - `src/pages/(group)/about.page.tsx` → `/about` (groups are stripped)
 * - `src/pages/docs/[...rest].page.tsx` → `/docs/**:rest` (bare `[...]` → `/docs/**`)
 */
export const filePathToRoute = (pagePath: string): string => {
	const ext = path.extname(pagePath);

	let route = path.relative("/src/pages", pagePath);

	if (ext.length) {
		route = route.slice(0, -ext.length);
	}

	route =
		route
			.replace(/\.[A-Za-z]+$/, "")
			.replace(/\(([^(/\\]+)\)[/\\]/g, "")
			.replace(/\[\.{3}]/g, "**")
			.replace(/\[\.{3}([^\]]+)]/g, (_, p: string) => "**:" + p.replace(/[^\w]/g, "_"))
			.replace(/\[([^/\]]+)]/g, (_, p: string) => ":" + p.replace(/[^\w]/g, "_"))
			.replace(/(\/|^)index$/, "") || "/";

	return withLeadingSlash(withoutTrailingSlash(route));
};
