import { expect, test } from "@playwright/test";

test.describe("ErrorBoundary (hono/jsx)", () => {
	test("page returns 200 — errors caught by boundary, not nitro handler", async ({ request }) => {
		const response = await request.get("/error-boundary");
		expect(response.status()).toBe(200);
	});

	test("renders static fallback when child throws synchronously", async ({ page }) => {
		await page.goto("/error-boundary");
		await expect(page.getByTestId("fallback-static")).toHaveText("static fallback");
	});

	test("fallbackRender receives the thrown error", async ({ page }) => {
		await page.goto("/error-boundary");
		await expect(page.getByTestId("fallback-render")).toHaveText("boom-render");
	});

	test("onError is called before fallbackRender", async ({ page }) => {
		await page.goto("/error-boundary");
		await expect(page.getByTestId("onerror-fallback")).toHaveText("onerror boom-onerror");
	});

	test("renders children normally when no error", async ({ page }) => {
		await page.goto("/error-boundary");
		await expect(page.getByTestId("ok-child")).toHaveText("ok child");
		await expect(page.getByTestId("should-not-show")).toHaveCount(0);
	});

	test("content outside boundary still renders", async ({ page }) => {
		await page.goto("/error-boundary");
		await expect(page.getByTestId("outside")).toHaveText("outside content");
	});

	test("thrown error from static-fallback boundary does not leak", async ({ page }) => {
		await page.goto("/error-boundary");
		const body = await page.locator("body").textContent();
		expect(body).not.toContain("boom-sync");
	});
});
