import yamf from "@pajecawav/yamf/vite";
import { defineConfig } from "vite";

export default defineConfig({
	optimizeDeps: {
		// TODO: is this needed?
		exclude: ["@pajecawav/yamf"],
	},
	plugins: [
		yamf({
			nitro: {
				errorHandler: "./src/error.ts",
				// fetched through the production SSR path during `vite build` and
				// written to .output/public as static files; routes that are not
				// listed keep server rendering
				prerender: {
					routes: ["/prerendered"],
				},
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
