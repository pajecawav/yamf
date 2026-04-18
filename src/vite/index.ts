import { nitro } from "nitro/vite";
import type { PluginOption } from "vite";
import { islands } from "./islands";
import { virtualAssets } from "./virtual-assets";
import { virtualPages } from "./virtual-pages";

const yamf = (): PluginOption[] => {
	const plugins: PluginOption[] = [];

	// TODO: extendable config
	plugins.push({
		name: "yamf:config",
		config() {
			return {
				environments: {
					ssr: {
						build: {
							rollupOptions: {
								input: "./src/entry-server.tsx",
							},
						},
					},
					client: {
						build: {
							rolldownOptions: {
								input: ["./src/client/index.ts"],
							},
						},
					},
				},
			};
		},
	});

	plugins.push(islands());

	plugins.push(virtualAssets());
	plugins.push(virtualPages());

	plugins.push(
		nitro({
			serverDir: "./src",
		}),
	);

	return plugins;
};

export default yamf;
