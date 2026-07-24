import { defineConfig } from "@playwright/test";

const PORT = 4321;
const URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: ".",
	testMatch: "**/*.spec.ts",
	fullyParallel: true,
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	reporter: [
		[process.env.CI ? "github" : "list"],
		["html", { outputFolder: "playwright-report" }],
	],
	use: {
		baseURL: URL,
	},
	webServer: {
		command: `pnpm build && pnpm play:build && pnpm --filter=playground exec vite preview --port=${PORT} --strictPort`,
		cwd: "..",
		url: URL,
		reuseExistingServer: !process.env.CI,
	},
});
