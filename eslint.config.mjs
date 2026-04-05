// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
	{
		ignores: ["**/dist", "**/.output", "**/coverage"],
	},
	{
		extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			"@typescript-eslint/explicit-member-accessibility": "error",
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
);
