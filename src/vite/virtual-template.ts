import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { Plugin } from "vite";
import { js } from "../shared/utils";

const TEMPLATE_PATH = "./src/template.html";

const DEFAULT_TEMPLATE = /* html */ `
<!DOCTYPE html>
<html>
    <head></head>
    <body>
        <!--ssr-outlet-->
    </body>
</html>
`.trim();

export const virtualTemplate = (): Plugin => {
	const virtualModuleId = "virtual:yamf:template";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-template",
		enforce: "pre",
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}

			return undefined;
		},
		async load(id) {
			if (id !== resolvedVirtualModuleId) {
				return;
			}

			try {
				const template = await readFile(TEMPLATE_PATH, "utf8");

				return js`export const template = ${JSON.stringify(template)};`;
			} catch (error) {
				console.log(error);

				if (error instanceof Error && "code" in error && error.code === "ENOENT") {
					return js`export const template = ${JSON.stringify(DEFAULT_TEMPLATE)};`;
				}

				throw error;
			}
		},
		handleHotUpdate({ file, server }) {
			if (relative(file, TEMPLATE_PATH) === "") {
				const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);

				if (mod) {
					server.moduleGraph.invalidateModule(mod);
				}

				// TODO: should reload?
				// server.ws.send({ type: "full-reload" });
			}
		},
	};
};
