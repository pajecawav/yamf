import { defineConfig } from "vite";
import yamf from "yamf/vite";

export default defineConfig({
	optimizeDeps: {
		exclude: ["yamf"],
	},
	plugins: [
		yamf({
			nitro: {
				errorHandler: "./src/error.ts",
			},
		}),
	],
	build: {
		sourcemap: true,
	},
	resolve: {
		tsconfigPaths: true,
	},
});
