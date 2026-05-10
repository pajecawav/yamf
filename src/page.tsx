import type { Child, FC, PropsWithChildren } from "hono/jsx";
import { Fragment } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import { Hono } from "hono/tiny";
import type { EventHandlerResponse, H3Event } from "nitro/h3";
import { HTTPResponse, withServerTiming } from "nitro/h3";
import { useSeoMeta } from "unhead";
import type { Unhead } from "unhead/server";
import { transformHtmlTemplate } from "unhead/server";
import { createStreamableHead, wrapStream } from "unhead/stream/server";
import type { ResolvableLink, UseSeoMetaInput } from "unhead/types";
import { clientAssets } from "virtual:yamf:assets";
import { template } from "virtual:yamf:template";
import { SSRContext } from "./context/ssr";
import type { ImportAssetsResult } from "./shared/assets";
import { YamfHead } from "./shared/head";

export type PageHandler = (
	event: H3Event,
	params: {
		serverAssets?: ImportAssetsResult;
		head?: YamfHead;
		Layout?: FC<PropsWithChildren>;
	},
) => EventHandlerResponse;

export type PageRenderer = (
	event: H3Event,
	params: {
		head: Unhead;
		seoHead: (input: UseSeoMetaInput) => void;
	},
) => HTTPResponse | Promise<HTTPResponse> | Child | Promise<Child>;

interface DefinePageOptions {
	render: PageRenderer;
	stream?: boolean;
	Layout?: FC<PropsWithChildren>;
}

export const definePage = (options: DefinePageOptions): PageHandler => {
	return async (event, { serverAssets, head: headInit, Layout = options.Layout ?? Fragment }) => {
		const assets = serverAssets ? clientAssets.merge(serverAssets) : clientAssets;

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

		const content = await options.render(event, { head, seoHead });

		if (content instanceof HTTPResponse) {
			return content;
		}

		const App = async () => (
			<SSRContext value={{ head, event }}>
				<Layout>{content}</Layout>
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
							template.replace("<!--ssr-outlet-->", html ?? ""),
						);

						return new Response(html, responseInit);
					}),
				)
				.request("/");
		}

		const stream = wrapStream(head, renderToReadableStream(<App />), template);

		return new Response(stream, responseInit);
	};
};
