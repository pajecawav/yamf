import { defineConfig } from "@playwright/test";

const PORT = 4321;
const URL = `http://localhost:${PORT}`;

const COMMAND = ["pnpm build", `pnpm vite preview --port=${PORT} --strictPort`].join(" && ");

const COMMAND_DEV = `pnpm vite --port=${PORT} --strictPort`;

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
		command: process.env.TEST_DEV ? COMMAND_DEV : COMMAND,
		cwd: "./e2e/app",
		url: URL,
		reuseExistingServer: !process.env.CI,
	},
});
