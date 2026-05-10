import { stringify } from "devalue";
import type { Child, FC } from "hono/jsx";
import type { ImportAssetsResultRaw } from "#/shared/assets";
import type { IslandClientDirective } from "./types";

declare module "hono/jsx" {
	namespace JSX {
		interface IntrinsicElements {
			"yamf-island": {
				"island-props"?: string;
				"island-src": string;
				"island-entry": string;
				"island-client": IslandClientDirective;
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
				// oxlint-disable-next-line typescript/no-unsafe-type-assertion
				island-client={props["yamf-client"] as IslandClientDirective}
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
