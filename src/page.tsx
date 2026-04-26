import type { Child, FC, PropsWithChildren } from "hono/jsx";
import { Fragment } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import { Hono } from "hono/tiny";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "nitro/h3";
import { HTTPResponse } from "nitro/h3";
import type { Unhead } from "unhead/server";
import { transformHtmlTemplate } from "unhead/server";
import { createStreamableHead, wrapStream } from "unhead/stream/server";
import type { ResolvableHead, ResolvableLink } from "unhead/types";
import { clientAssets } from "virtual:yamf:assets";
import { template } from "virtual:yamf:template";
import { SSRContext } from "./context/ssr";
import type { ImportAssetsResult } from "./shared/assets";

export type PageHandler = (
	event: H3Event<EventHandlerRequest>,
	params: {
		serverAssets?: ImportAssetsResult;
		head?: ResolvableHead;
		Layout?: FC<PropsWithChildren>;
	},
) => EventHandlerResponse;

export type PageRenderer = (
	event: H3Event<EventHandlerRequest>,
	params: { head: Unhead },
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

		head.push({
			link: [
				...assets.js.map((attrs): ResolvableLink => ({ rel: "modulepreload", ...attrs })),
				...assets.css.map((attrs): ResolvableLink => ({ rel: "stylesheet", ...attrs })),
			],
			script: [{ type: "module", src: assets.entry }],
		});

		const content = await options.render(event, { head });

		if (content instanceof HTTPResponse) {
			return content;
		}

		const App = async () => (
			<SSRContext value={{ head }}>
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
				.get("/", async c => {
					const response = await c.html(<App />);

					let html = await response.text();

					// TODO: figure out why head is broken
					html = transformHtmlTemplate(
						head,
						template.replace("<!--ssr-outlet-->", html ?? ""),
					);

					return new Response(html, responseInit);
				})
				.request("/");
		}

		const stream = wrapStream(head, renderToReadableStream(<App />), template);

		return new Response(stream, responseInit);
	};
};
