import { nitro, type NitroPluginConfig } from "nitro/vite";
import type { PluginOption } from "vite";
import { islands } from "./islands";
import { virtualAssets } from "./virtual-assets";
import { virtualPages } from "./virtual-pages";

interface YamfOptions {
	nitro?: NitroPluginConfig;
}

const yamf = (options: YamfOptions = {}): PluginOption[] => {
	const plugins: PluginOption[] = [];

	plugins.push(islands());

	plugins.push(virtualAssets());
	plugins.push(virtualPages());

	plugins.push(nitro(options.nitro));

	return plugins;
};

export default yamf;
