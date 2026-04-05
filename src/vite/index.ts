import { nitro, type NitroPluginConfig } from "nitro/vite";
import type { PluginOption } from "vite";
import solid from "vite-plugin-solid";
import { islands } from "./islands";
import { virtualAssets } from "./virtual-assets";
import { virtualIslands } from "./virtual-islands";

interface YamfOptions {
	nitro?: NitroPluginConfig;
}

const yamf = (options: YamfOptions = {}): PluginOption[] => {
	const plugins: PluginOption[] = [];

	// TODO: dynamic ssr option?
	plugins.push(solid({ ssr: true }));

	plugins.push(islands());
	plugins.push(virtualIslands());

	plugins.push(virtualAssets());

	plugins.push(
		nitro({
			...options.nitro,
			// assets: {
			// 	serverEnvironments: ["nitro", "ssr"],
			// },
		}),
	);

	return plugins;
};

export default yamf;
