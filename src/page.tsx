import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Fragment, type Child } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import { Hono } from "hono/tiny";
import type { EventHandlerResponse, H3Event } from "nitro/h3";
import { HTTPError, HTTPResponse, withServerTiming } from "nitro/h3";
import { useSeoMeta } from "unhead";
import type { Unhead } from "unhead/server";
import { transformHtmlTemplate } from "unhead/server";
import { createStreamableHead, renderSSRHeadSuspenseChunk, wrapStream } from "unhead/stream/server";
import type { ResolvableHead, ResolvableLink, UseSeoMetaInput } from "unhead/types";
import { Root as RootComponent } from "virtual:yamf:root";
import { template } from "virtual:yamf:template";
import { Router } from "wouter";
import { SSRContext } from "./context/ssr";
import type { ImportAssetsResult } from "./shared/assets";
import { YamfHead } from "./shared/head";

export type PageHandler = (
	event: H3Event,
	params: {
		assets: ImportAssetsResult;
		head?: YamfHead;
		nonce?: string;
	},
) => EventHandlerResponse;

export type PageRenderer<P = unknown, Q = unknown> = (
	event: H3Event,
	params: {
		head: Unhead;
		seoHead: (input: UseSeoMetaInput) => void;
		params: P;
		query: Q;
	},
) => HTTPResponse | Child | Promise<Child | HTTPResponse>;

export interface PageCacheOptions {
	maxAge: number;
	swr?: number;
	private?: boolean;
}

interface DefinePageOptions<P = unknown, Q = unknown> {
	render: PageRenderer<P, Q>;
	stream?: boolean;
	/**
	 * Cache-Control for the page response. `60` is shorthand for
	 * `{ maxAge: 60 }` → `Cache-Control: public, max-age=60`; the object form
	 * adds `stale-while-revalidate` and `private`.
	 */
	cache?: number | PageCacheOptions;
	/**
	 * Standard-schema validator (zod, valibot, arktype, …) for the route
	 * params. On failure the page throws HTTPError 404 before render; the
	 * validated, typed output is passed to render as `params`.
	 */
	params?: StandardSchemaV1<unknown, P>;
	/**
	 * Standard-schema validator for the search params. On failure the page
	 * throws HTTPError 400 before render; the validated, typed output is
	 * passed to render as `query`. Repeated keys collapse to the last value.
	 */
	query?: StandardSchemaV1<unknown, Q>;
}

const cacheControlValue = (cache: number | PageCacheOptions): string => {
	const options = typeof cache === "number" ? { maxAge: cache } : cache;

	const parts = [options.private ? "private" : "public", `max-age=${options.maxAge}`];

	if (options.swr !== undefined) {
		parts.push(`stale-while-revalidate=${options.swr}`);
	}

	return parts.join(", ");
};

// resolvable head inputs may be functions — resolve them for serialization
const unwrapEntryInput = (input: unknown): ResolvableHead => {
	return (
		typeof input === "function" ? (input as () => ResolvableHead)() : input
	) as ResolvableHead;
};

const collectHeadInputs = (head: Unhead): ResolvableHead[] => {
	const inputs: ResolvableHead[] = [];

	for (const entry of head.entries.values()) {
		inputs.push(unwrapEntryInput(entry.input));
	}

	return inputs;
};

const serializeHeadPayload = (inputs: ResolvableHead[]): string => {
	return JSON.stringify(inputs)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026");
};

const scriptNonceAttr = (nonce?: string): string => {
	return nonce ? ` nonce="${nonce.replace(/"/g, "&quot;")}"` : "";
};

// client handshake: re-register the server head entries (titleTemplate,
// htmlAttrs, page-level head) into the client head via the unhead stream
// queue, so post-hydration updates keep templates and adopt SSR tags
// instead of duplicating them
const headPayloadScript = (inputs: ResolvableHead[], nonce?: string): string => {
	if (!inputs.length) {
		return "";
	}

	return `<script${scriptNonceAttr(nonce)}>window.__unhead__&&window.__unhead__.push(${serializeHeadPayload(inputs)})</script>`;
};

// injected at the start of <body>: unhead rebuilds the html/head tags and
// appends its head tags (including the stream bootstrap shim) inside <head>,
// so the payload must come after them for window.__unhead__ to exist
const injectHeadPayload = (template: string, script: string): string => {
	if (!script) {
		return template;
	}

	if (/<body[^>]*>/.test(template)) {
		return template.replace(/<body[^>]*>/, match => `${match}${script}`);
	}

	return template.replace("</head>", `</head>${script}`);
};

const validateWithSchema = async <T,>(
	schema: StandardSchemaV1<unknown, T> | undefined,
	value: unknown,
	status: 400 | 404,
	what: string,
): Promise<T> => {
	if (!schema) {
		return value as T;
	}

	const result = await schema["~standard"].validate(value);

	if (result.issues) {
		throw new HTTPError(`Invalid ${what}`, {
			status,
			cause: new Error(result.issues.map(issue => issue.message).join("; ")),
		});
	}

	return result.value;
};

export const definePage = <P = unknown, Q = unknown>(
	options: DefinePageOptions<P, Q>,
): PageHandler => {
	return async (event, { assets, head: headInit, nonce }) => {
		if (options.cache !== undefined) {
			event.res.headers.set("cache-control", cacheControlValue(options.cache));
		}

		const params = await validateWithSchema(
			options.params,
			event.context.params,
			404,
			"path params",
		);

		const query = await validateWithSchema(
			options.query,
			Object.fromEntries(event.url.searchParams),
			400,
			"query params",
		);

		const { head } = createStreamableHead({ init: [headInit] });
		const seoHead = (input?: UseSeoMetaInput) => useSeoMeta(head, input);
		seoHead(headInit?.seo);

		head.push({
			link: [
				...assets.js.map((attrs): ResolvableLink => ({ rel: "modulepreload", ...attrs })),
				...assets.css.map((attrs): ResolvableLink => ({ rel: "stylesheet", ...attrs })),
			],
			script: [{ type: "module", src: assets.entry }],
		});

		const content = await options.render(event, { head, seoHead, params, query });

		if (content instanceof HTTPResponse) {
			return content;
		}

		// must be collected before wrapStream — it clears entries after the shell
		const payloadScript = headPayloadScript(collectHeadInputs(head), nonce);

		const templateWithPayload = injectHeadPayload(template, payloadScript);

		const Root = RootComponent ?? Fragment;

		const App = async () => (
			<SSRContext value={{ head, event }}>
				<Router ssrPath={event.url.pathname} ssrSearch={event.url.search}>
					<Root>{content}</Root>
				</Router>
			</SSRContext>
		);

		const responseInit = {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		};

		if (!options.stream) {
			// TODO: figure out how expensive this is
			return new Hono()
				.get("/", async c =>
					withServerTiming(event, "#render", async () => {
						const response = await c.html(<App />);

						let html = await response.text();

						html = transformHtmlTemplate(
							head,
							templateWithPayload.replace("<!--ssr-outlet-->", html ?? ""),
						);

						return new Response(html, responseInit);
					}),
				)
				.request("/");
		}

		const stream = wrapStream(
			head,
			renderToReadableStream(<App />),
			templateWithPayload,
			undefined,
			{
				// same as unhead's default flushChunk, but with CSP nonce support
				flushChunk: () => {
					let chunk: string;

					try {
						chunk = renderSSRHeadSuspenseChunk(head);
					} catch {
						return "";
					}

					if (!chunk) {
						return "";
					}

					return `<script${scriptNonceAttr(nonce)}>window.__unhead__&&(${chunk});document.currentScript.remove()</script>`;
				},
			},
		);

		return new Response(stream, responseInit);
	};
};
