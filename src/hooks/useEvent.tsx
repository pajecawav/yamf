import type { H3Event } from "nitro";
import type { EventHandlerRequest } from "nitro/h3";
import { useSSRContext } from "#/context/ssr";

export const useEvent = (): H3Event<EventHandlerRequest> => {
	const ctx = useSSRContext();

	if (!ctx) {
		throw new Error("SSR context not found");
	}

	return ctx.event;
};
