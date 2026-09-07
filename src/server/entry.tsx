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

const registeredRoutes = new Map<string, string>();

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

	const conflictingFile = registeredRoutes.get(route);

	if (conflictingFile && conflictingFile !== relativePath) {
		console.warn(
			`[yamf] duplicate page route "${route}": ${conflictingFile} and ${relativePath} both map to it — the routes conflict`,
		);
	}

	registeredRoutes.set(route, relativePath);

	addRoute(router, "GET", route, {
		handler,
		serverAssets: pagesServerAssets[relativePath],
	});
}

export type ServerEntry = EventHandlerWithFetch<EventHandlerRequest, Promise<unknown>>;

export interface DefineServerEntryOptions {
	head?: YamfHead | ((event: H3Event) => YamfHead);
	disableEarlyHints?: boolean;
	/**
	 * CSP nonce for the inline scripts yamf injects (head handshake payload
	 * and streamed head patches).
	 *
	 * Note: unhead's stream bootstrap script (`window.__unhead__||(…)`) does
	 * not support a nonce in unhead 3.x — with a strict `script-src` CSP it
	 * must be allowed separately (e.g. via a hash).
	 */
	nonce?: string | ((event: H3Event) => string | undefined);
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

		// early hints are pointless inside the prerender worker — nitro's
		// prerenderer buffers the response to a file and discards them
		if (!options?.disableEarlyHints && !event.req.headers.has("x-nitro-prerender")) {
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
			nonce: typeof options?.nonce === "function" ? options.nonce(event) : options?.nonce,
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
