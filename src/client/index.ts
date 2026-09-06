/**
 * Tiny bootstrap for the island runtime.
 *
 * Defines the <yamf-island> custom element and dynamically imports the real
 * hydration runtime (hono/jsx dom renderer, devalue, unhead client) only when
 * the document actually contains an island. Pages — or whole apps — without
 * islands never pay for it.
 */

const pending: Set<HTMLElement> = new Set();

type Hydrate = (island: HTMLElement) => void;

let hydrate: Hydrate | null = null;
let loading: boolean = false;

const loadRuntime = (): void => {
	if (loading) {
		return;
	}

	loading = true;

	void import("../island/client").then(({ hydrateIsland }) => {
		hydrate = hydrateIsland;

		for (const island of pending) {
			pending.delete(island);
			hydrate(island);
		}
	});
};

customElements.define(
	"yamf-island",
	class extends HTMLElement {
		public connectedCallback() {
			if (hydrate) {
				hydrate(this);
				return;
			}

			pending.add(this);
			loadRuntime();
		}

		public disconnectedCallback() {
			pending.delete(this);
		}
	},
);
