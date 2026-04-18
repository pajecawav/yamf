import type { ImportAssetsResultRaw } from "#/shared/types";
import type { FC } from "hono/jsx";

export type IslandComponent<Props extends Record<string, unknown>> = FC<Props> & {
	src?: string;
	assets: ImportAssetsResultRaw;
};
