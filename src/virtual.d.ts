declare module "virtual:yamf:assets" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	export const clientAssets: import("./shared/assets").ImportAssetsResult;
}

declare module "virtual:yamf:pages" {
	export const pages: Record<string, () => Promise<PageHandler>>;

	export const assets: Record<string, ImportAssetsResult>;
}

declare module "virtual:yamf:template" {
	export const template: string;
}
