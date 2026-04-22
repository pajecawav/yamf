import { SSRContext } from "#/context/ssr";
import { useContext } from "hono/jsx";
import { useHead as _useHead } from "unhead";
import type { ClientUnhead } from "unhead/client";
import type { ResolvableHead } from "unhead/types";

declare global {
	interface Window {
		__UNHEAD__?: ClientUnhead;
	}
}

export const useHead = (input?: ResolvableHead): void => {
	if (import.meta.env.SSR) {
		const ctx = useContext(SSRContext);

		if (ctx?.head) {
			_useHead(ctx.head, input);
		}
	} else if (window.__UNHEAD__) {
		_useHead(window.__UNHEAD__, input);
	}
};
