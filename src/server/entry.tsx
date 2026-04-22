import type { PageHandler } from "#/page";
import type { EventHandlerRequest, EventHandlerWithFetch } from "nitro/h3";
import { defineHandler, HTTPError, writeEarlyHints } from "nitro/h3";
import path from "node:path";
import { addRoute, createRouter, findRoute } from "rou3";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import { clientAssets } from "virtual:yamf:assets";
import { assets as serverAssets, pages } from "virtual:yamf:pages";

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
		serverAssets: serverAssets[relativePath],
	});
}

export const defineServerEntry = (): EventHandlerWithFetch<
	EventHandlerRequest,
	Promise<unknown>
> => {
	return defineHandler(async event => {
		const route = findRoute(router, "GET", event.url.pathname);

		if (!route) {
			throw new HTTPError("Not found", { status: 404 });
		}

		const { handler, serverAssets } = route.data;

		const assets = serverAssets ? serverAssets.merge(clientAssets) : clientAssets;

		await writeEarlyHints(event, {
			link: [
				...assets.js.map(script => `<${script.href}>; rel=modulepreload`),
				...assets.css.map(style => `<${style.href}>; rel=preload; as=style`),
			],
		});

		return (await handler())(event, { serverAssets });
	});
};
