import { resolveModulePath } from "exsolve";
import type { Plugin } from "vite";
import { js } from "../shared/utils";

const ROOT_PATH = "./src/root";

export const virtualRoot = (): Plugin => {
	const virtualModuleId = "virtual:yamf:root";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-root",
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

			const root = resolveModulePath(ROOT_PATH, {
				try: true,
				suffixes: ["", "/index"],
				extensions: [".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".mts", ".cts"],
			});

			if (!root) {
				return js`
const Root = null;
const rootAssets = null;

export { Root, rootAssets };
        `;
			}

			return js`
import Root from "${ROOT_PATH}";
import rootAssets from "${ROOT_PATH}?assets=ssr";

export { Root, rootAssets };
`.trim();
		},
	};
};
