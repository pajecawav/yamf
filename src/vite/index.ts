import type { NitroPluginConfig } from "nitro/vite";
import { nitro } from "nitro/vite";
import type { PluginOption } from "vite";
import { islands } from "./islands";
import { virtualAssets } from "./virtual-assets";
import { virtualPages } from "./virtual-pages";
import { virtualTemplate } from "./virtual-template";

export interface YamfOptions {
	nitro?: NitroPluginConfig;
}

const yamf = (options?: YamfOptions): PluginOption[] => {
	const plugins: PluginOption[] = [];

	// TODO: extendable config
	plugins.push({
		name: "yamf:config",
		config() {
			return {
				environments: {
					ssr: {
						build: {
							// TODO: figure out if this should be true
							cssCodeSplit: false,
							rollupOptions: {
								input: "/src/server.tsx",
							},
						},
					},
					client: {
						build: {
							rolldownOptions: {
								input: ["/src/client/index.ts"],
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
	plugins.push(virtualTemplate());

	plugins.push(
		nitro({
			extends: {
				serverDir: "/src",
				renderer: false,
				compressPublicAssets: {
					gzip: true,
					brotli: true,
				},
				publicAssets: [
					{
						baseURL: "assets",
						dir: "./public/assets",
						maxAge: 365 * 24 * 60 * 60,
					},
				],
			},
			...options?.nitro,
		}),
	);

	return plugins;
};

export default yamf;
