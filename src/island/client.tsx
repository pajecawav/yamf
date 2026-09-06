import { parse } from "devalue";
import type { FC } from "hono/jsx";
import { hydrateRoot } from "hono/jsx/dom/client";
import { withLeadingSlash } from "ufo";
import type { IslandClientDirectiveSerialized } from "./types";

declare let __yamf_raw_import__: <T>(file: string) => Promise<T>;

const listeners: WeakMap<Element, VoidFunction> = new WeakMap();

const observer: IntersectionObserver = new IntersectionObserver(entries => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			listeners.get(entry.target)?.();
			unobserve(entry.target);
		}
	}
});

const observe = (target: Element, cb: VoidFunction) => {
	observer.observe(target);
	listeners.set(target, cb);
};

const unobserve = (target: Element) => {
	observer.unobserve(target);
	listeners.delete(target);
};

// Safari does not enable requestIdleCallback by default in any stable
// release — without a fallback, client:idle islands never hydrate there
const requestIdle = (callback: () => void): void => {
	const ric = window.requestIdleCallback;

	if (typeof ric === "function") {
		ric(callback);
		return;
	}

	setTimeout(callback, 1);
};

/**
 * Hydrates a single <yamf-island> island. Called by the bootstrap custom
 * element (src/client/index.ts) once this runtime module has been loaded.
 */
export const hydrateIsland = (island: HTMLElement): void => {
	const islandProps = parse(island.getAttribute("island-props") ?? "{}");
	const islandSrc = island.getAttribute("island-src");
	const islandEntry = island.getAttribute("island-entry");
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	const islandClient = (island.getAttribute("island-client") ??
		"load") as IslandClientDirectiveSerialized;

	if (!islandSrc) {
		throw new Error("Missing island-src attribute");
	}

	if (!islandEntry) {
		throw new Error("Missing island-entry attribute");
	}

	const hydrate = (mod: Record<string, FC>) => {
		const Comp = mod[islandEntry];

		if (!Comp) {
			throw new Error(`Missing island entry ${islandEntry} in ${islandSrc}`);
		}

		hydrateRoot(island, <Comp {...islandProps} />);
	};

	const initIsland = () => {
		const src = withLeadingSlash(islandSrc);
		void __yamf_raw_import__<Record<string, FC>>(src).then(hydrate);
	};

	switch (islandClient) {
		case "true":
		case "load":
			initIsland();
			break;
		case "idle":
			requestIdle(initIsland);
			break;
		case "visible":
			// yamf-island has `display: contents` which breaks IntersectionObserver
			// so we have to observe the first child instead if it exists
			if (island.firstElementChild) {
				observe(island.firstElementChild, initIsland);
			} else {
				initIsland();
			}
			break;
		case "false":
		case "skip":
			break;
		default:
			islandClient satisfies never;
			// oxlint-disable-next-line typescript/restrict-template-expressions
			throw new Error(`Invalid island-client value: ${islandClient}`);
	}
};
