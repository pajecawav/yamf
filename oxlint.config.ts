import { defineOxlintConfig } from "@pajecawav/tools";

export default defineOxlintConfig({
	ignorePatterns: ["**/dist", "**/.output", "**/coverage", "playground"],
});
