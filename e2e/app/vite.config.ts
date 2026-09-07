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
				// explicit route list (no crawlLinks) to keep the prerendered
				// set deterministic; routes with live-SSR test coverage
				// (/, /streaming, /head-stream) deliberately stay dynamic
				prerender: {
					routes: ["/islands", "/props", "/this/is/nested", "/static-streaming", "/404"],
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
