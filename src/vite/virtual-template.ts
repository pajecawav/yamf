import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { js } from "../shared/utils";

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
				const template = await readFile("./src/template.html", "utf8");

				return js`export const template = ${JSON.stringify(template)};`;
			} catch (error) {
				console.log(error);

				if (error instanceof Error && "code" in error && error.code === "ENOENT") {
					return js`export const template = ${JSON.stringify(DEFAULT_TEMPLATE)};`;
				}

				throw error;
			}
		},
	};
};
