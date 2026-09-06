import { stringify } from "devalue";
import type { Child, FC } from "hono/jsx";
import type { ImportAssetsResultRaw } from "#/shared/assets";
import type { IslandClientDirective, IslandProps } from "./types";

// configurable via the YAMF_ISLAND_PROPS_LIMIT env / define
const PROPS_WARNING_LIMIT = Number(import.meta.env["YAMF_ISLAND_PROPS_LIMIT"]) || 16 * 1024;

declare module "hono/jsx" {
	namespace JSX {
		interface IntrinsicElements {
			"yamf-island": {
				"island-props"?: string;
				"island-src": string;
				"island-entry": string;
				"island-client"?: IslandClientDirective;
				children: Child;
				style?: JSX.CSSProperties;
			};
		}
	}
}

const isSkipDirective = (directive: IslandClientDirective | undefined): boolean => {
	return directive === false || directive === "skip";
};

export const createIsland = (
	Component: FC,
	exportName: string,
	assets: ImportAssetsResultRaw,
): FC => {
	const ComponentWrapper: FC<IslandProps> & { name: string } = ({
		"yamf-client": clientDirective,
		...props
	}) => {
		if (!assets.entry) {
			throw new Error(`Missing island entry for island ${Component.name}`);
		}

		// skip islands are never hydrated — serializing their props into the
		// attribute would be pure dead weight in the HTML
		const skip = isSkipDirective(clientDirective);

		let islandProps: string | undefined;

		if (!skip) {
			islandProps = stringify(props);

			if (import.meta.env.DEV && islandProps.length > PROPS_WARNING_LIMIT) {
				console.warn(
					`[yamf] island "${exportName}" receives ${(islandProps.length / 1024).toFixed(1)} KB of serialized props — consider slimming them down (limit: ${PROPS_WARNING_LIMIT} bytes, configurable via YAMF_ISLAND_PROPS_LIMIT)`,
				);
			}
		}

		return (
			<yamf-island
				island-props={islandProps}
				island-src={assets.entry}
				island-entry={exportName}
				island-client={clientDirective}
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
