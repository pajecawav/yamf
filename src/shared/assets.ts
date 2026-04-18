// https://github.com/nitrojs/nitro/blob/bfbb207c720ce10ec7ad7887c7a8269d493eec55/lib/vite.types.d.mts
export type ImportAssetsResult = ImportAssetsResultRaw & {
	merge(...args: ImportAssetsResultRaw[]): ImportAssetsResult;
};

export type ImportAssetsResultRaw = {
	entry?: string;
	js: { href: string }[];
	css: { href: string; "data-vite-dev-id"?: string }[];
};
