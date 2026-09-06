import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NitroPluginConfig } from "nitro/vite";
import { nitro } from "nitro/vite";
import type { EnvironmentOptions, PluginOption } from "vite";
import { islands } from "./islands";
import { prerenderModule } from "./prerender";
import { virtualAssets } from "./virtual-assets";
import { virtualErrorHandler } from "./virtual-error-handler";
import { virtualPages } from "./virtual-pages";
import { virtualRoot } from "./virtual-root";
import { virtualTemplate } from "./virtual-template";

export interface YamfOptions {
	nitro?: NitroPluginConfig;
}

const yamf = (options?: YamfOptions): PluginOption[] => {
	const plugins: PluginOption[] = [];

	// TODO: extendable config
	plugins.push({
		name: "yamf:config",
		config(config) {
			// resolved against the vite root (not cwd) so running vite from
			// another working directory does not silently drop the ssr entry
			const root = config.root ?? process.cwd();

			const ssrEnv: EnvironmentOptions = {
				build: {
					// TODO: figure out if this should be true
					cssCodeSplit: false,
					rolldownOptions: {
						input: "./src/server.tsx",
					},
				},
			};

			return {
				ssr: {
					// we need to inline because otherwise fullstack plugin fails to build manifest for assets imports
					// also, we need to bundle everything so that the `react` -> `@hono/react-compat` alias
					// is applied to all dependencies (e.g. wouter) in dev mode. Externalized deps are
					// loaded natively by Node, bypassing Vite's resolve.alias.
					noExternal: true,
				},
				optimizeDeps: {
					include: [
						"hono",
						"hono/jsx/dom/client",
						"hono/jsx/jsx-runtime",
						"devalue",
						"ufo",
					],
				},
				resolve: {
					alias: [
						{ find: "react", replacement: "@hono/react-compat" },
						{ find: "react-dom", replacement: "@hono/react-compat" },
						// use-sync-external-store is a CJS package that requires("react").
						// Vite's SSR module runner can't process CJS, so we alias it to
						// @hono/react-compat which exports useSyncExternalStore from hono/jsx.
						{
							find: /^use-sync-external-store(?:\/shim(?:\/.*)?)?$/,
							replacement: "@hono/react-compat",
						},
					],
				},
				environments: {
					...(existsSync(resolve(root, "./src/server.tsx")) ? { ssr: ssrEnv } : {}),
					client: {
						build: {
							rolldownOptions: {
								input: "./src/client/index.ts",
							},
						},
					},
				},
			};
		},
	});

	plugins.push(islands());

	plugins.push(virtualErrorHandler(options));
	plugins.push(virtualAssets());
	plugins.push(virtualPages());
	plugins.push(virtualTemplate());
	plugins.push(virtualRoot());

	// registers the nitro module that makes prerender work (see prerenderModule)
	plugins.push({
		name: "yamf:prerender",
		nitro: prerenderModule,
	});

	// reserved nitro keys are yamf-controlled and intentionally win over user
	// values; everything else the user passes through wins. user publicAssets
	// are merged with yamf's instead of being dropped
	const {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		serverDir: _serverDir,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		renderer: _renderer,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		compressPublicAssets: _compressPublicAssets,
		publicAssets: userPublicAssets,
		...userNitro
	} = options?.nitro ?? {};

	plugins.push(
		nitro({
			...userNitro,
			serverDir: "./src",
			renderer: false,
			compressPublicAssets: {
				gzip: true,
				brotli: true,
			},
			publicAssets: [
				...(userPublicAssets ?? []),
				{
					baseURL: "assets",
					dir: "./public/assets",
					maxAge: 365 * 24 * 60 * 60,
				},
			],
		}),
	);

	return plugins;
};

export default yamf;
