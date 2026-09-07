import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const publicDir = fileURLToPath(new URL("../app/.output/public", import.meta.url));

const readHtml = (file: string): string => {
	const full = `${publicDir}/${file}`;
	expect(existsSync(full), `${file} must exist in the prerendered output`).toBe(true);
	return readFileSync(full, "utf8");
};

test.describe("prerender", () => {
	test.skip(!!process.env.TEST_DEV, "prerender only runs in production builds");

	test("static pages are written to the public dir", () => {
		for (const file of [
			"islands/index.html",
			"props/index.html",
			"this/is/nested/index.html",
		]) {
			const html = readHtml(file);
			expect(html).toContain("<!doctype html>");
			expect(html).toContain("</html>");
		}
	});

	test("prerendered page contains ssr islands and client assets", () => {
		const html = readHtml("islands/index.html");
		// five explicit + one default-export island
		expect(html.match(/<yamf-island/g)?.length).toBe(6);
		// client entry + page css from the vite asset manifests
		expect(html).toMatch(/<script[^>]+src="\/assets\//);
		expect(html).toMatch(/<link[^>]+href="\/assets\//);
	});

	test("island props are serialized into the static html", () => {
		const html = readHtml("props/index.html");
		expect(html).toContain("2024-01-15T12:30:00.000Z");
		expect(html).toContain('data-testid="date"');
	});

	test("streaming page fully materializes when buffered to disk", () => {
		const html = readHtml("static-streaming/index.html");
		// complete document — the stream was consumed to the end, not truncated
		expect(html).toContain("</html>");
		// the shell kept its fallbacks…
		expect(html).toContain("Loading 1...");
		expect(html).toContain("Loading 2...");
		// …and the resolved async islands made it into the buffered output
		expect(html).toContain(">10</button>");
		expect(html).toContain(">20</button>");
	});

	test("/404 is prerendered as 404.html, not 404/index.html", () => {
		const html = readHtml("404.html");
		expect(html).toContain('data-testid="not-found"');
		expect(existsSync(`${publicDir}/404/index.html`)).toBe(false);
	});

	test("live server serves the prerendered file verbatim", async ({ request }) => {
		const file = readHtml("islands/index.html");
		const response = await request.get("/islands");
		expect(response.status()).toBe(200);
		expect(await response.text()).toBe(file);
	});

	test("prerendered page hydrates and becomes interactive", async ({ page }) => {
		await page.goto("/islands", { waitUntil: "networkidle" });

		const button = page.locator("yamf-island button").first();
		await expect(button).toHaveText("1");
		await button.click();
		await expect(button).toHaveText("2");
	});

	test("non-prerendered routes keep server rendering", async ({ request }) => {
		const response = await request.get("/params/42");
		expect(response.status()).toBe(200);
		expect(await response.text()).toContain("42");
	});

	test("unknown routes still 404 via the error handler", async ({ request }) => {
		const response = await request.get("/nonexistent");
		expect(response.status()).toBe(404);
	});
});
