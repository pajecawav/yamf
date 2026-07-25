import type { NitroPluginConfig } from "nitro/vite";
import type { Plugin } from "vite";
import { js } from "../shared/utils";

export interface VirtualErrorHandlerOptions {
	nitro?: NitroPluginConfig;
}

export const virtualErrorHandler = (options?: VirtualErrorHandlerOptions): Plugin => {
	const virtualModuleId = "virtual:yamf:error-handler";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-error-handler",
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

			const errorHandler = options?.nitro?.errorHandler;

			if (!errorHandler) {
				return js`export const errorHandler = null;`;
			}

			if (Array.isArray(errorHandler)) {
				throw new Error("Multiple error handlers are not supported");
			}

			return js`export { default as errorHandler } from "${errorHandler}";`;
		},
	};
};
