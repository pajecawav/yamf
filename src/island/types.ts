import type { Component } from "solid-js";

export type IslandComponent<Props extends Record<string, unknown>> = Component<Props> & {
	src?: string;
	entry?: string;
};
