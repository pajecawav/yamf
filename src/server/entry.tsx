import path from "node:path";
import type { FC, PropsWithChildren } from "hono/jsx";
import type { EventHandlerRequest, EventHandlerWithFetch, H3Event } from "nitro/h3";
import { defineHandler, HTTPError, writeEarlyHints } from "nitro/h3";
import { addRoute, createRouter, findRoute } from "rou3";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { ResolvableHead } from "unhead/types";
import { clientAssets } from "virtual:yamf:assets";
import { pages, assets as serverAssets } from "virtual:yamf:pages";
import type { PageHandler } from "#/page";

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

export type ServerEntry = EventHandlerWithFetch<EventHandlerRequest, Promise<unknown>>;

export interface DefineServerEntryOptions {
	head?: ResolvableHead | ((event: H3Event<EventHandlerRequest>) => ResolvableHead);
	Layout?: FC<PropsWithChildren>;
}

export const defineServerEntry = (options?: DefineServerEntryOptions): ServerEntry => {
	return defineHandler(async event => {
		const route = findRoute(router, "GET", event.url.pathname);

		if (!route) {
			throw new HTTPError("Not found", { status: 404 });
		}

		const { handler, serverAssets } = route.data;
		event.context.params = route.params;

		const assets = serverAssets ? serverAssets.merge(clientAssets) : clientAssets;

		await writeEarlyHints(event, {
			link: [
				...assets.js.map(script => `<${script.href}>; rel=modulepreload`),
				...assets.css.map(style => `<${style.href}>; rel=preload; as=style`),
			],
		});

		return (await handler())(event, {
			serverAssets,
			head: typeof options?.head === "function" ? options.head(event) : options?.head,
			Layout: options?.Layout,
		});
	});
};
