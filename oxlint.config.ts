import { defineOxlintConfig } from "@pajecawav/tools";

export default defineOxlintConfig({
	ignorePatterns: ["**/dist", "**/.output", "**/coverage", "playground"],
	rules: {
		"typescript/consistent-return": "allow",
		"no-underscore-dangle": "allow",
	},
	overrides: [
		{
			files: ["unit/**"],
			rules: {
				// tsgolint false-positives on node:test's describe/it/assert
				// call signatures (void returns flagged as promises)
				"typescript/no-floating-promises": "off",
				"typescript/no-misused-promises": "off",
			},
		},
	],
});
