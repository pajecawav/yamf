import { html, raw } from "hono/html";
import type { Child } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "nitro/h3";
import type { ImportAssetsResult } from "./shared/assets";
import { SSRContext } from "./context/ssr";

export type PageHandler = (
	event: H3Event<EventHandlerRequest>,
	params: { serverAssets?: ImportAssetsResult },
) => EventHandlerResponse;

export type PageLoader<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
) => TLoaderData | Promise<TLoaderData>;

export type PageRenderer<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
	params: { loaderData: TLoaderData },
) => Child | Promise<Child>;

interface DefinePageOptions<TLoaderData> {
	loader: PageLoader<TLoaderData>;
	render: PageRenderer<TLoaderData>;
}

export const definePage = <TLoaderData = never,>({
	loader,
	render,
}: DefinePageOptions<TLoaderData>): PageHandler => {
	return async (event, params) => {
		const loaderData = await loader(event);

		const Content = async () => <>{await render(event, { loaderData })}</>;

		const app = (
			<SSRContext value={{ serverAssets: params.serverAssets }}>
				<Content />
			</SSRContext>
		);

		const docType = raw("<!DOCTYPE html>");

		const stream = renderToReadableStream(html`${docType}${app}`);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	};
};
