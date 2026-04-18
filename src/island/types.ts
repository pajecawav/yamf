import type { ImportAssetsResultRaw } from "virtual:yamf:assets";
import type { Component } from "solid-js";

export type IslandComponent<Props extends Record<string, unknown>> = Component<Props> & {
	src?: string;
	assets: ImportAssetsResultRaw;
};
