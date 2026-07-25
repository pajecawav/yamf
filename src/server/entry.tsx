import path from "node:path";
import {
	defineHandler,
	EventHandler,
	H3Event,
	HTTPError,
	writeEarlyHints,
	type EventHandlerRequest,
	type EventHandlerWithFetch,
} from "nitro/h3";
import { addRoute, createRouter, findRoute } from "rou3";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import { clientAssets } from "virtual:yamf:assets";
import { errorHandler } from "virtual:yamf:error-handler";
import { pages, assets as pagesServerAssets } from "virtual:yamf:pages";
import { rootAssets } from "virtual:yamf:root";
import type { PageHandler } from "#/page";
import { YamfHead } from "#/shared/head";

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
		serverAssets: pagesServerAssets[relativePath],
	});
}

export type ServerEntry = EventHandlerWithFetch<EventHandlerRequest, Promise<unknown>>;

export interface DefineServerEntryOptions {
	head?: YamfHead | ((event: H3Event) => YamfHead);
	disableEarlyHints?: boolean;
}

export const defineServerEntry = (options?: DefineServerEntryOptions): ServerEntry => {
	const rootHandler: EventHandler<EventHandlerRequest, Promise<unknown>> = async event => {
		const route = findRoute(router, "GET", event.url.pathname);

		if (!route) {
			throw new HTTPError("Not found", { status: 404 });
		}

		const { handler, serverAssets } = route.data;
		event.context.params = route.params;

		const assets = clientAssets.merge(...[rootAssets, serverAssets].filter(x => !!x));

		if (!options?.disableEarlyHints) {
			const link = [
				...assets.js.map(script => `<${script.href}>; rel=modulepreload`),
				...assets.css.map(style => `<${style.href}>; rel=preload; as=style`),
			];

			if (link.length) {
				await writeEarlyHints(event, { link });
			}
		}

		return (await handler())(event, {
			assets,
			head: typeof options?.head === "function" ? options.head(event) : options?.head,
		});
	};

	return defineHandler(async event => {
		if (!errorHandler) {
			return rootHandler(event);
		}

		try {
			return await rootHandler(event);
		} catch (error) {
			const httpError = error instanceof HTTPError ? error : new HTTPError({ cause: error });

			return errorHandler(httpError, event);
		}
	});
};
