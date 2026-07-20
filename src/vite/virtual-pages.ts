import type { Plugin } from "vite";
import { js } from "../shared/utils";

export const virtualPages = (): Plugin => {
	const virtualModuleId = "virtual:yamf:pages";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-pages",
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
const pages = import.meta.glob("/src/pages/**/*.page.{js,mjs,cjs,ts,mts,cts,tsx,jsx}", {
	import: "default",
});

const assets = import.meta.glob(
	"/src/pages/**/*.page.{js,mjs,cjs,ts,mts,cts,tsx,jsx}",
	{
		import: "default",
		query: "?assets=ssr",
		eager: true,
	},
);

export { pages, assets };
`.trim();
		},
	};
};
