import { parse } from "devalue";
import type { FC } from "hono/jsx";
import { hydrateRoot } from "hono/jsx/dom/client";
import { withLeadingSlash } from "ufo";
import type { IslandClientDirective } from "./types";

declare let __island_raw_import__: <T>(file: string) => Promise<T>;

const listeners = new WeakMap<Element, VoidFunction>();

const observer = new IntersectionObserver(entries => {
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

customElements.define(
	"yamf-island",
	class extends HTMLElement {
		public connectedCallback() {
			const islandProps = parse(this.getAttribute("island-props") ?? "{}");
			const islandSrc = this.getAttribute("island-src");
			const islandEntry = this.getAttribute("island-entry");
			// oxlint-disable-next-line typescript/no-unsafe-type-assertion
			const islandClient = (this.getAttribute("island-client") ??
				"load") as IslandClientDirective;

			if (!islandSrc) {
				throw new Error("Missing island-src attribute");
			}

			if (!islandEntry) {
				throw new Error("Missing island-entry attribute");
			}

			const hydrateIsland = (mod: Record<string, FC>) => {
				const Comp = mod[islandEntry];

				if (!Comp) {
					throw new Error(`Missing island entry ${islandEntry} in ${islandSrc}`);
				}

				hydrateRoot(this, <Comp {...islandProps} />);
			};

			const initIsland = () => {
				const src = withLeadingSlash(islandSrc);
				void __island_raw_import__<Record<string, FC>>(src).then(hydrateIsland);
			};

			switch (islandClient) {
				case true:
				case "load":
					initIsland();
					break;
				case "idle":
					requestIdleCallback(initIsland);
					break;
				case "visible":
					// yamf-island has `display: contents` which breaks IntersectionObserver
					// so we have to observe the first child instead if it exists
					if (this.firstElementChild) {
						observe(this.firstElementChild, initIsland);
					} else {
						initIsland();
					}
					break;
				case false:
				case "skip":
					break;
				default:
					islandClient satisfies never;
					// oxlint-disable-next-line typescript/restrict-template-expressions
					throw new Error(`Invalid island-client value: ${islandClient}`);
			}
		}

		public disconnectedCallback() {
			unobserve(this);
		}
	},
);
