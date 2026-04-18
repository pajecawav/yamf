import type { Plugin } from "vite";
import { js } from "../shared/utils";

export const virtualAssets = (): Plugin => {
	const virtualModuleId = "virtual:yamf:assets";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-assets",
		enforce: "pre",
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

			return js`
import clientAssets from "./client/index.ts?assets=client";

export { clientAssets };
`.trim();
		},
	};
};
