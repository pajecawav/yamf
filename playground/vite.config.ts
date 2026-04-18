import { defineConfig } from "vite";
import yamf from "yamf/vite";

export default defineConfig({
	optimizeDeps: {
		exclude: ["yamf"],
	},
	plugins: [yamf()],
	build: {
		sourcemap: true,
	},
	resolve: {
		tsconfigPaths: true,
	},
});
