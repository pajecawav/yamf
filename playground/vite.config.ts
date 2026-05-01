import { defineConfig } from "vite";
import yamf from "@pajecawav/yamf/vite";

export default defineConfig({
	optimizeDeps: {
		// TODO: is this needed?
		exclude: ["@pajecawav/yamf"],
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
