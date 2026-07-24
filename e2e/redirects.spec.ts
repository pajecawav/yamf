import { expect, test } from "@playwright/test";

test.describe("redirects", () => {
	test("returns 302 status", async ({ request }) => {
		const response = await request.get("/e2e/redirect", {
			maxRedirects: 0,
		});
		expect(response.status()).toBe(302);
	});

	test("has Location header pointing to /e2e/calc", async ({ request }) => {
		const response = await request.get("/e2e/redirect", {
			maxRedirects: 0,
		});
		expect(response.headers().location).toBe("/e2e/calc");
	});

	test("browser follows redirect to /e2e/calc", async ({ page }) => {
		await page.goto("/e2e/redirect");
		await page.waitForURL(/\/e2e\/calc$/);
		expect(page.url()).toMatch(/\/e2e\/calc$/);
	});

	test("renders calc page content after redirect", async ({ page }) => {
		await page.goto("/e2e/redirect");
		await page.waitForURL(/\/e2e\/calc$/);
		await expect(page.locator("body")).toContainText("= 14");
	});
});
