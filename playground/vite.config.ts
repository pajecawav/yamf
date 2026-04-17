import { defineConfig } from "vite";
import yamf from "yamf/vite";
import { globSync } from "tinyglobby";

export default defineConfig({
	// TODO: figure out file watching
	// server: {
	// 	watch: {
	// 		ignored: ["!**/node_modules/yamf/**"],
	// 	},
	// },
	optimizeDeps: {
		exclude: ["yamf"],
		// entries: ["./client/index.ts", "./components/**/*.island.*"],
		entries: ["./client/index.ts", "./**/*.island.*"],
	},
	plugins: [
		yamf({
			nitro: {
				serverDir: "./",
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
					input: "./entry-server.tsx",
				},
			},
		},
		client: {
			build: {
				sourcemap: true,
				rolldownOptions: {
					input: ["./client/index.ts", ...globSync("./**/*.island.*")],
				},
			},
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
});
