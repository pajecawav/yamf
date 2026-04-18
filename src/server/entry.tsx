import type { PageHandler } from "#/page";
import { defineHandler, HTTPError } from "nitro/h3";
import path from "node:path";
import { addRoute, createRouter, findRoute } from "rou3";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import { assets, pages } from "virtual:yamf:pages";

interface Route {
	handler: () => Promise<PageHandler>;
	serverAssets?: ImportAssetsResult;
}

const router = createRouter<Route>();

for (const [relativePath, handler] of Object.entries(pages).toSorted((a, b) =>
	a[0].localeCompare(b[0]),
)) {
	const ext = path.extname(relativePath);

	let route = path.relative("/src/pages", relativePath);

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

	route = withLeadingSlash(withoutTrailingSlash(route));

	addRoute(router, "GET", route, {
		handler,
		serverAssets: assets[relativePath],
	});
}

export const defineServerEntry = () => {
	return defineHandler(async event => {
		const route = findRoute(router, "GET", event.url.pathname);

		if (!route) {
			throw new HTTPError("Not found", { status: 404 });
		}

		const { handler, serverAssets } = route.data;

		return (await handler())(event, { serverAssets });
	});
};
