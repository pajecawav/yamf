import type { H3Event } from "nitro";
import { useSSRContext } from "#/context/ssr";

export const useEvent = (): H3Event => {
	const ctx = useSSRContext();

	if (!ctx) {
		throw new Error("SSR context not found");
	}

	return ctx.event;
};
