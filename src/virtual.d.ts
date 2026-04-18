declare module "virtual:yamf:assets" {
	// https://github.com/nitrojs/nitro/blob/bfbb207c720ce10ec7ad7887c7a8269d493eec55/lib/vite.types.d.mts
	type ImportAssetsResult = ImportAssetsResultRaw & {
		merge(...args: ImportAssetsResultRaw[]): ImportAssetsResult;
	};

	type ImportAssetsResultRaw = {
		entry?: string;
		js: { href: string }[];
		css: { href: string; "data-vite-dev-id"?: string }[];
	};

	export const clientAssets: ImportAssetsResult;
	export const serverAssets: ImportAssetsResult;
}
