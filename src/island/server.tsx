import { stringify } from "devalue";
import type { Child, FC } from "hono/jsx";
import type { ImportAssetsResultRaw } from "virtual:yamf:assets";

declare module "hono/jsx" {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"yamf-island": {
				"island-props"?: string;
				"island-src": string;
				"island-entry": string;
				children: Child;
				style?: JSX.CSSProperties;
			};
		}
	}
}

export const createIsland = (
	Component: FC,
	exportName: string,
	assets: ImportAssetsResultRaw,
): FC => {
	const ComponentWrapper: FC & { name: string } = props => {
		if (!assets.entry) {
			throw new Error(`Missing island entry for island ${Component.name}`);
		}

		return (
			<yamf-island
				island-props={stringify(props)}
				island-src={assets.entry}
				island-entry={exportName}
				// TODO: export CSS?
				style={{ display: "contents" }}
			>
				<Component {...props} />
			</yamf-island>
		);
	};

	Object.defineProperty(ComponentWrapper, "name", {
		value: Component.name,
	});

	return ComponentWrapper;
};
