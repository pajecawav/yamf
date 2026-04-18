import { defineConfig } from "vite";
import yamf from "yamf/vite";
import { globSync } from "tinyglobby";

export default defineConfig({
	optimizeDeps: {
		exclude: ["yamf"],
		entries: ["./src/client/index.ts", "./src/**/*.island.*"],
	},
	plugins: [
		yamf({
			nitro: {
				serverDir: "./src",
			},
		}),
	],
	build: {
		sourcemap: true,
	},
	environments: {
		ssr: {
			build: {
				rollupOptions: {
					input: "./src/entry-server.tsx",
				},
			},
		},
		client: {
			build: {
				sourcemap: true,
				rolldownOptions: {
					input: ["./src/client/index.ts", ...globSync("./src/**/*.island.*")],
				},
			},
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
});
