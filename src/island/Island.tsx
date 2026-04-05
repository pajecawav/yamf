import { stringify } from "devalue";
import type { IslandComponent } from "./types";

declare module "solid-js" {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"yamf-island": {
				"island-props"?: string;
				"island-src": string;
				children: JSX.Element;
				style?: JSX.CSSProperties;
			};
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IslandProps<P extends Record<string, any>> {
	Component: IslandComponent<P>;
	props: P;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Island = <P extends Record<string, any>>({ Component, props }: IslandProps<P>) => {
	const src = Component.src;
	const entry = Component.entry;

	if (!src) {
		throw new Error(`Missing island src for island ${Component.name}`);
	}

	if (!entry) {
		throw new Error(`Missing island entry for island ${Component.name}`);
	}

	return (
		<yamf-island
			island-props={stringify(props)}
			island-src={src}
			island-entry={entry}
			// TODO: export CSS?
			style={{ display: "contents" }}
		>
			<Component {...props} />
		</yamf-island>
	);
};
