// @ts-check

/** @type {import('lint-staged').Configuration} */
export default {
	"*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}": [
		"prettier --write",
		() => "pnpm lint:eslint",
		() => "pnpm lint:tsc",
	],
	"*.{json,md,yml,css}": "prettier --write",
};
