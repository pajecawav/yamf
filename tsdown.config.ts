import solid from "rolldown-plugin-solid";
import { defineConfig } from "tsdown";

// export both js and jsx
export default defineConfig([
	{
		unbundle: true,
		platform: "neutral",
		tsconfig: "./tsconfig.lib.json",
		// use the solid plugin to handle jsx
		plugins: [solid()],
	},
	{
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
	},
]);
