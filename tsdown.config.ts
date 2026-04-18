import solid from "unplugin-solid/rolldown";
import { defineConfig, type InlineConfig, type UserConfig } from "tsdown";

const getSharedOptions = (cfg: InlineConfig): UserConfig => ({
	// TODO: figure out
	watch: cfg.watch ? "./src" : false,
	deps: {
		neverBundle: [/^virtual:/],
	},
});

// export both js and jsx
export default defineConfig(cfg => [
	{
		entry: "./src/vite/index.ts",
		unbundle: true,
		platform: "node",
		outDir: "dist/vite",
		tsconfig: "./tsconfig.node.json",
		...getSharedOptions(cfg),
	},
	{
		entry: "./src/server/index.ts",
		unbundle: true,
		platform: "node",
		outDir: "dist/server",
		tsconfig: "./tsconfig.lib.json",
		// use the solid plugin to handle jsx
		plugins: [solid({ ssr: true, hot: false })],
		...getSharedOptions(cfg),
	},
	{
		entry: ["./src/index.ts", "./src/client/index.ts"],
		unbundle: true,
		platform: "neutral",
		tsconfig: "./tsconfig.lib.json",
		// use the solid plugin to handle jsx
		plugins: [solid({ ssr: false, hot: false })],
		...getSharedOptions(cfg),
	},
	{
		entry: ["./src/index.ts", "./src/client/index.ts"],
		unbundle: true,
		platform: "neutral",
		tsconfig: "./tsconfig.lib.json",
		inputOptions(options) {
			options.transform = {
				...options.transform,
				jsx: "preserve",
			};
		},
		outExtensions: () => ({ js: ".jsx" }),
		...getSharedOptions(cfg),
	},
]);
