import type { Child } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "nitro/h3";
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

export type PageLoader<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
) => TLoaderData | Promise<TLoaderData>;

export type PageRenderer<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
	params: { loaderData: TLoaderData; head: Unhead },
) => Child | Promise<Child>;

interface DefinePageOptions<TLoaderData> {
	loader: PageLoader<TLoaderData>;
	render: PageRenderer<TLoaderData>;
}

const TEMPLATE = "<!DOCTYPE html><html><head></head><body></body></html>";

export const definePage = <TLoaderData = never,>({
	loader,
	render,
}: DefinePageOptions<TLoaderData>): PageHandler => {
	return async (event, { serverAssets }) => {
		const loaderData = await loader(event);

		const assets = serverAssets ? clientAssets.merge(serverAssets) : clientAssets;

		const { head } = createStreamableHead({});

		head.push({
			link: [
				...assets.js.map((attrs): ResolvableLink => ({ rel: "modulepreload", ...attrs })),
				...assets.css.map((attrs): ResolvableLink => ({ rel: "stylesheet", ...attrs })),
			],
			script: [{ type: "module", src: assets.entry }],
		});

		const App = async () => (
			<SSRContext value={{ head }}>{await render(event, { loaderData, head })}</SSRContext>
		);
		const stream = wrapStream(head, renderToReadableStream(<App />), TEMPLATE);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	};
};
