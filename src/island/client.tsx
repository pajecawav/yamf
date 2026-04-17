import { parse } from "devalue";
import type { Component } from "solid-js";
import { hydrate } from "solid-js/web";
import { withLeadingSlash } from "ufo";

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

				hydrate(() => <Comp {...islandProps} />, this);
			};

			const src = withLeadingSlash(islandSrc);

			void import(src).then(hydrateIsland);
		}
	},
);
