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

// a sync throw from one island (missing attribute, bad props) must not
// abort hydration of the queued rest
const hydrateSafely = (island: HTMLElement): void => {
	if (!hydrate) {
		return;
	}

	try {
		hydrate(island);
	} catch (error) {
		console.error("[yamf] failed to hydrate island", error);
	}
};

const loadRuntime = (): void => {
	if (loading) {
		return;
	}

	loading = true;

	void import("../island/client")
		.then(({ hydrateIsland }) => {
			hydrate = hydrateIsland;

			for (const island of pending) {
				pending.delete(island);
				hydrateSafely(island);
			}
		})
		.catch(error => {
			// allow a later island to retry (e.g. after a transient chunk
			// load failure) instead of staying broken forever
			loading = false;
			console.error("[yamf] failed to load the island hydration runtime", error);
		});
};

customElements.define(
	"yamf-island",
	class extends HTMLElement {
		public connectedCallback() {
			if (hydrate) {
				hydrateSafely(this);
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
