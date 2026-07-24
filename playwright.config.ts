import { defineConfig } from "@playwright/test";

const PORT = 4321;
const URL = `http://localhost:${PORT}`;

const COMMAND_PROD = [
	"pnpm build",
	"pnpm play:build",
	`pnpm --filter=playground exec vite preview --port=${PORT} --strictPort`,
].join(" && ");

const COMMAND_DEV = [
	"pnpm build",
	`pnpm --filter=playground exec vite --port=${PORT} --strictPort`,
].join(" && ");

export default defineConfig({
	testDir: "./e2e",
	testMatch: "**/*.spec.ts",
	fullyParallel: true,
	reporter: [
		[process.env.CI ? "github" : "list"],
		["html", { outputFolder: "playwright-report" }],
	],
	use: {
		baseURL: URL,
	},
	webServer: {
		command: process.env.TEST_DEV ? COMMAND_DEV : COMMAND_PROD,
		url: URL,
		reuseExistingServer: !process.env.CI,
	},
});
