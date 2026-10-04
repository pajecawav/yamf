import { useEffect, useRef } from "hono/jsx";
import { useHead as _useHead, useSeoMeta as _useSeoMeta } from "unhead";
import type { ClientUnhead } from "unhead/client";
import type { ActiveHeadEntry, UseSeoMetaInput } from "unhead/types";
import { useSSRContext } from "#/context/ssr";
import { ensureClientHead } from "#/island/head";
import type { YamfHead } from "#/shared/head";

if (!import.meta.env.SSR) {
	ensureClientHead();
}

/**
 * Binds an unhead entry to the calling component's lifecycle: the entry is
 * created once on mount, patched on every re-render with the latest input,
 * and disposed on unmount. Without this, every re-render pushes a new entry
 * that is never removed — a leak and growing DOM render cost.
 */
const useHeadEntryLifecycle = <T,>(
	input: T | undefined,
	createEntry: (head: ClientUnhead, input: T) => ActiveHeadEntry<T>,
): void => {
	const entryRef = useRef<ActiveHeadEntry<T> | null>(null);

	useEffect(() => {
		const head = window.__yamfHead__;

		if (!head || input === undefined) {
			return;
		}

		const entry = createEntry(head, input);

		entryRef.current = entry;

		return () => {
			entry.dispose();
			entryRef.current = null;
		};
		// mount-only: the entry is created once per component instance
		// oxlint-disable-next-line eslint(exhaustive-deps)
	}, []);

	useEffect(() => {
		if (input !== undefined) {
			entryRef.current?.patch(input);
		}
	}, [input]);
};

export const useHead = (input?: YamfHead): void => {
	if (import.meta.env.SSR) {
		if (input === undefined) {
			return;
		}

		const ctx = useSSRContext();

		if (ctx?.head) {
			// the custom `seo` key is yamf sugar for useSeoMeta — process it
			// instead of passing an unknown key down to unhead
			const { seo, ...rest } = input;

			if (seo !== undefined) {
				_useSeoMeta(ctx.head, seo);
			}

			_useHead(ctx.head, rest);
		}

		return;
	}

	useHeadEntryLifecycle(input, (head, resolved) => _useHead(head, resolved));
};

export const useSeoMeta = (input?: UseSeoMetaInput): void => {
	if (import.meta.env.SSR) {
		if (input === undefined) {
			return;
		}

		const ctx = useSSRContext();

		if (ctx?.head) {
			_useSeoMeta(ctx.head, input);
		}

		return;
	}

	useHeadEntryLifecycle(input, (head, resolved) => _useSeoMeta(head, resolved));
};
