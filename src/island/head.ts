import { createHead } from "unhead/client";
import type { ClientUnhead } from "unhead/client";
import type { ResolvableHead } from "unhead/types";

interface StreamQueue {
	_q?: unknown[][];
	push?: (batch: unknown[]) => void;
}

declare global {
	interface Window {
		__unhead__?: StreamQueue;
		__yamfHead__?: ClientUnhead;
	}
}

/**
 * Creates the client head, drains everything the server streamed into
 * `window.__unhead__` (the handshake payload and streamed suspense patches)
 * and upgrades the stub so late patches from an open stream keep applying.
 *
 * Idempotent: it is called from the island hydration runtime (which loads
 * whenever a page contains islands) and from the `useHead` hook module —
 * whichever runs first wins.
 */
export const ensureClientHead = (): ClientUnhead => {
	if (window.__yamfHead__) {
		return window.__yamfHead__;
	}

	const head = createHead();

	const drain = (batch: unknown[]): void => {
		for (const input of batch) {
			head.push(input as ResolvableHead);
		}
	};

	// inline scripts (the handshake payload and streamed suspense patches)
	// queue into window.__unhead__ while the document parses; drain them into
	// the client head
	const queue = window.__unhead__?._q;

	if (queue) {
		for (const batch of queue) {
			drain(batch);
		}
	}

	// keep late patches (a stream that is still open) working
	window.__unhead__ = { push: drain };

	window.__yamfHead__ = head;

	return head;
};
