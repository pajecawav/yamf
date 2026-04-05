// declare module "virtual:yamf:islands" {
// 	import type { Component } from "solid-js";
// 	export const ISLANDS: Record<string, Component | undefined>;
// 	export const LAZY_ISLANDS: Record<string, (() => Promise<Component>) | undefined>;
// }

declare module "virtual:yamf:assets" {
	// https://github.com/nitrojs/nitro/blob/bfbb207c720ce10ec7ad7887c7a8269d493eec55/lib/vite.types.d.mts
	type ImportAssetsResult = ImportAssetsResultRaw & {
		merge(...args: ImportAssetsResultRaw[]): ImportAssetsResult;
	};

	type ImportAssetsResultRaw = {
		entry?: string;
		js: { href: string }[];
		css: { href: string; "data-vite-dev-id"?: string }[];
	};

	export const clientAssets: ImportAssetsResult;
	export const serverAssets: ImportAssetsResult;
}
