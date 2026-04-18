import { nitro, type NitroPluginConfig } from "nitro/vite";
import type { PluginOption } from "vite";
import solid from "vite-plugin-solid";
import { islands } from "./islands";
import { virtualAssets } from "./virtual-assets";

interface YamfOptions {
	nitro?: NitroPluginConfig;
}

const yamf = (options: YamfOptions = {}): PluginOption[] => {
	const plugins: PluginOption[] = [];

	// TODO: dynamic ssr option?
	plugins.push(solid({ ssr: true, hot: false }));

	plugins.push(islands());

	plugins.push(virtualAssets());

	plugins.push(nitro(options.nitro));

	return plugins;
};

export default yamf;
