import { parse } from "devalue";
import type { Component } from "solid-js";
import {
	// hydrate,
	render,
} from "solid-js/web";
import { withLeadingSlash } from "ufo";
// import { ISLANDS, LAZY_ISLANDS } from "virtual:yamf:islands";

// customElements.define(
// 	"yamf-island",
// 	class extends HTMLElement {
// 		public connectedCallback() {
// 			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// 			const islandProps = parse(this.getAttribute("island-props") ?? "{}");
// 			const islandSrc = this.getAttribute("island-src");

// 			if (!islandSrc) {
// 				throw new Error("Missing island-src attribute");
// 			}

// 			const hydrateIsland = (Comp: Component) => {
// 				hydrate(() => <Comp {...islandProps} />, this);
// 			};

// 			const src = withLeadingSlash(islandSrc);

// 			if (ISLANDS[src]) {
// 				hydrateIsland(ISLANDS[src]);
// 			} else if (LAZY_ISLANDS[src]) {
// 				const loader = LAZY_ISLANDS[src];
// 				void loader().then(hydrateIsland);
// 			} else {
// 				throw new Error("Invalid island-src attribute");
// 			}
// 		}
// 	},
// );

customElements.define(
	"yamf-island",
	class extends HTMLElement {
		public connectedCallback() {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const islandProps = parse(this.getAttribute("island-props") ?? "{}");
			const islandSrc = this.getAttribute("island-src");
			const islandEntry = this.getAttribute("island-entry");

			if (!islandSrc) {
				throw new Error("Missing island-src attribute");
			}

			if (!islandEntry) {
				throw new Error("Missing island-entry attribute");
			}

			// const hydrateIsland = (Comp: Component) => {
			// 	hydrate(() => <Comp {...islandProps} />, this);
			// };

			const hydrateIsland = (mod: Record<string, Component>) => {
				const Comp = mod[islandEntry];

				if (!Comp) {
					throw new Error(`Missing island entry ${islandEntry} in ${islandSrc}`);
				}

				// TODO: figure out why hydrate doesn't work
				// hydrate(() => <Comp {...islandProps} />, this);
				render(() => <Comp {...islandProps} />, this);
			};

			const src = withLeadingSlash(islandSrc);

			void import(src).then(hydrateIsland);
		}
	},
);
