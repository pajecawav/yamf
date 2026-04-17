import { defineHandler, HTTPError } from "nitro/h3";
import path from "node:path";
import { addRoute, createRouter, findRoute } from "rou3";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { PageHandler } from "yamf";

const router = createRouter<() => Promise<PageHandler>>();

const PAGES = import.meta.glob<PageHandler>("./pages/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}", {
	import: "default",
});

const pages = Object.entries(PAGES)
	.toSorted((a, b) => a[0].localeCompare(b[0]))
	.map(([relativePath, handler]) => {
		const ext = path.extname(relativePath);

		let route = path.relative("./pages", relativePath);

		if (ext.length) {
			route = route.slice(0, -ext.length);
		}

		route =
			route
				.replace(/\.[A-Za-z]+$/, "")
				.replace(/\(([^(/\\]+)\)[/\\]/g, "")
				.replace(/\[\.{3}]/g, "**")
				.replace(/\[\.{3}([^\]]+)]/g, (_, p: string) => "**:" + p.replace(/[^\w-]/g, "_"))
				.replace(/\[([^/\]]+)]/g, (_, p: string) => ":" + p.replace(/[^\w-]/g, "_"))
				.replace(/(\/|^)index$/, "") || "/";

		return {
			route: withLeadingSlash(withoutTrailingSlash(route)),
			handler,
		};
	});

for (const { route, handler } of pages) {
	addRoute(router, "GET", route, handler);
}

export default defineHandler(async event => {
	const route = findRoute(router, "GET", event.url.pathname);

	if (!route) {
		throw new HTTPError("Not found", { status: 404 });
	}

	const handler = await route.data();

	return handler(event);
});
