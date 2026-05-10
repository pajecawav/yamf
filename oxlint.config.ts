import { defineOxlintConfig } from "@pajecawav/tools";

export default defineOxlintConfig({
	ignorePatterns: ["**/dist", "**/.output", "**/coverage", "playground"],
	rules: {
		"typescript/consistent-return": "allow",
		"no-underscore-dangle": "allow",
	},
});
