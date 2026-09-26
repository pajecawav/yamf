import { defineConfig } from "@playwright/test";

const PORT = 4321;
const URL = `http://localhost:${PORT}`;

// NB: the long-running server must bypass the pnpm wrapper — pnpm 12.6.0 broke
// signal forwarding for non-interactive runs (pnpm#7374), so Playwright cannot
// kill the webServer on teardown: vite survives as an orphan holding the port.
const VITE = "node node_modules/vite/bin/vite.js";

const COMMAND = ["pnpm build", `${VITE} preview --port=${PORT} --strictPort`].join(" && ");

const COMMAND_DEV = `${VITE} --port=${PORT} --strictPort`;

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
