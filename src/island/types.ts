import type { FC } from "hono/jsx";
import type { ImportAssetsResultRaw } from "virtual:yamf:assets";

export type IslandComponent<Props extends Record<string, unknown>> = FC<Props> & {
	src?: string;
	assets: ImportAssetsResultRaw;
};
