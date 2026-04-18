import { html, raw } from "hono/html";
import type { Child } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import type { EventHandler, EventHandlerRequest, H3Event } from "nitro/h3";

export type PageHandler = EventHandler<EventHandlerRequest, Child | Promise<Child>>;

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
}: DefinePageOptions<TLoaderData>): EventHandler => {
	return async event => {
		const loaderData = await loader(event);

		const app = await render(event, { loaderData });

		const docType = raw("<!DOCTYPE html>");

		const stream = renderToReadableStream(html`${docType}${app}`);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	};
};
