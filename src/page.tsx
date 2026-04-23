import type { Child } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "nitro/h3";
import { HTTPResponse } from "nitro/h3";
import type { Unhead } from "unhead/server";
import { createStreamableHead, wrapStream } from "unhead/stream/server";
import type { ResolvableLink } from "unhead/types";
import { clientAssets } from "virtual:yamf:assets";
import { SSRContext } from "./context/ssr";
import type { ImportAssetsResult } from "./shared/assets";

export type PageHandler = (
	event: H3Event<EventHandlerRequest>,
	params: { serverAssets?: ImportAssetsResult },
) => EventHandlerResponse;

export type PageRenderer = (
	event: H3Event<EventHandlerRequest>,
	params: { head: Unhead },
) => HTTPResponse | Promise<HTTPResponse> | Child | Promise<Child>;

interface DefinePageOptions {
	render: PageRenderer;
}

const TEMPLATE = "<!DOCTYPE html><html><head></head><body></body></html>";

export const definePage = ({ render }: DefinePageOptions): PageHandler => {
	return async (event, { serverAssets }) => {
		const assets = serverAssets ? clientAssets.merge(serverAssets) : clientAssets;

		const { head } = createStreamableHead({});

		head.push({
			link: [
				...assets.js.map((attrs): ResolvableLink => ({ rel: "modulepreload", ...attrs })),
				...assets.css.map((attrs): ResolvableLink => ({ rel: "stylesheet", ...attrs })),
			],
			script: [{ type: "module", src: assets.entry }],
		});

		const content = await render(event, { head });

		if (content instanceof HTTPResponse) {
			return content;
		}

		const App = async () => <SSRContext value={{ head }}>{content}</SSRContext>;
		const stream = wrapStream(head, renderToReadableStream(<App />), TEMPLATE);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	};
};
