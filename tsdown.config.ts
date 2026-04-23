import { defineConfig, type UserConfig } from "tsdown";

const getSharedOptions = (): UserConfig => ({
	deps: {
		neverBundle: [/^virtual:/],
	},
});

export default defineConfig([
	{
		entry: "./src/vite/index.ts",
		unbundle: true,
		platform: "node",
		outDir: "dist/vite",
		tsconfig: "./tsconfig.lib.json",
		...getSharedOptions(),
	},
	{
		entry: "./src/server/index.ts",
		unbundle: true,
		platform: "node",
		outDir: "dist/server",
		tsconfig: "./tsconfig.lib.json",
		...getSharedOptions(),
	},
	{
		entry: ["./src/index.ts", "./src/client/index.ts"],
		unbundle: true,
		platform: "neutral",
		tsconfig: "./tsconfig.lib.json",
		...getSharedOptions(),
	},
]);
