import { resolve } from "node:path";
import { resolveModulePath } from "exsolve";
import type { Plugin } from "vite";
import { js } from "../shared/utils";

const ROOT_PATH = "./src/root";

export const virtualRoot = (): Plugin => {
	const virtualModuleId = "virtual:yamf:root";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	// resolved against the vite root (not cwd) so running vite from another
	// working directory does not silently skip the root layout
	let root = process.cwd();

	return {
		name: "yamf:virtual-root",
		configResolved(config) {
			root = config.root;
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}

			return undefined;
		},
		load(id) {
			if (id !== resolvedVirtualModuleId) {
				return;
			}

			const rootPath = resolve(root, ROOT_PATH);

			const rootModule = resolveModulePath(rootPath, {
				try: true,
				suffixes: ["", "/index"],
				extensions: [".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".mts", ".cts"],
			});

			if (!rootModule) {
				return js`
const Root = null;
const rootAssets = null;

export { Root, rootAssets };
        `;
			}

			return js`
import Root from "${rootModule}";
import rootAssets from "${rootModule}?assets=ssr";

export { Root, rootAssets };
`.trim();
		},
	};
};
