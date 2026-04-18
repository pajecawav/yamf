import { parse } from "devalue";
import type { FC } from "hono/jsx";
import { hydrateRoot } from "hono/jsx/dom/client";
import { withLeadingSlash } from "ufo";

declare let __island_raw_import__: <T>(file: string) => Promise<T>;

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

			const hydrateIsland = (mod: Record<string, FC>) => {
				const Comp = mod[islandEntry];

				if (!Comp) {
					throw new Error(`Missing island entry ${islandEntry} in ${islandSrc}`);
				}

				hydrateRoot(this, <Comp {...islandProps} />);
			};

			const src = withLeadingSlash(islandSrc);

			void __island_raw_import__<Record<string, FC>>(src).then(hydrateIsland);
		}
	},
);
