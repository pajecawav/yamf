import { defineConfig, type InlineConfig, type UserConfig } from "tsdown";

const getSharedOptions = (cfg: InlineConfig): UserConfig => ({
	// TODO: figure out
	watch: cfg.watch ? "./src" : false,
	deps: {
		neverBundle: [/^virtual:/],
	},
});

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
		...getSharedOptions(cfg),
	},
	{
		entry: ["./src/index.ts", "./src/client/index.ts"],
		unbundle: true,
		platform: "neutral",
		tsconfig: "./tsconfig.lib.json",
		...getSharedOptions(cfg),
	},
]);
