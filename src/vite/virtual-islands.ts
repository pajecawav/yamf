import type { Plugin } from "vite";

// TODO: delete file

const js = (str: TemplateStringsArray, ...args: unknown[]) => {
	return str.reduce((acc, cur, i) => {
		return acc + cur + String(args[i]);
	}, "");
};

export const virtualIslands = (): Plugin => {
	const virtualModuleId = "virtual:yamf:islands";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "yamf:virtual-islands",
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id !== resolvedVirtualModuleId) {
				return;
			}

			return js`
export const ISLANDS = import.meta.glob("/src/**/*.island.ts(x)?", {
	import: "default",
	eager: true,
});

export const LAZY_ISLANDS = import.meta.glob("/src/**/*.island.lazy.ts(x)?", {
	import: "default",
});
`.trim();
		},
	};
};
