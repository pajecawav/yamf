import { useHead as _useHead, useSeoMeta as _useSeoMeta } from "unhead";
import type { ClientUnhead } from "unhead/client";
import { createHead } from "unhead/client";
import type { ResolvableHead, UseSeoMetaInput } from "unhead/types";
import { useSSRContext } from "#/context/ssr";

declare global {
	interface Window {
		__UNHEAD__?: ClientUnhead;
	}
}

if (!import.meta.env.SSR) {
	window.__UNHEAD__ = createHead();
}

export const useHead = (input?: ResolvableHead): void => {
	if (import.meta.env.SSR) {
		const ctx = useSSRContext();

		if (ctx?.head) {
			_useHead(ctx.head, input);
		}
	} else if (window.__UNHEAD__) {
		_useHead(window.__UNHEAD__, input);
	}
};

export const useSeoMeta = (input?: UseSeoMetaInput): void => {
	if (import.meta.env.SSR) {
		const ctx = useSSRContext();

		if (ctx?.head) {
			_useSeoMeta(ctx.head, input);
		}
	} else if (window.__UNHEAD__) {
		_useSeoMeta(window.__UNHEAD__, input);
	}
};
