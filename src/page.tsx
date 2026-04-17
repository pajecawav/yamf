import type { EventHandler, EventHandlerRequest, H3Event } from "nitro/h3";
import type { JSX } from "solid-js";
import { renderToStream } from "solid-js/web";

export type PageHandler = EventHandler<EventHandlerRequest, JSX.Element | Promise<JSX.Element>>;

export type PageLoader<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
) => TLoaderData | Promise<TLoaderData>;

export type PageRenderer<TLoaderData> = (
	event: H3Event<EventHandlerRequest>,
	params: { loaderData: TLoaderData },
) => JSX.Element | Promise<JSX.Element>;

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

		// const html = await renderToStringAsync(() => render(event, { loaderData }));

		// return new Response(html, {
		// 	headers: {
		// 		"Content-Type": "text/html",
		// 	},
		// });

		const stream = renderToStream(() => render(event, { loaderData }));

		const { readable, writable } = new TransformStream();

		// TODO: prepend doctype html
		stream.pipeTo(writable);

		return new Response(readable, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	};
};
