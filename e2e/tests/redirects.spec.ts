import { expect, test } from "@playwright/test";

test.describe("redirects", () => {
	test("returns 302 status and Location header", async ({ request }) => {
		const response = await request.get("/e2e/redirect", {
			maxRedirects: 0,
		});
		expect(response.status()).toBe(302);
		expect(response.headers().location).toBe("/e2e");
	});

	test("browser follows redirect to /e2e", async ({ page }) => {
		await page.goto("/e2e/redirect");
		await page.waitForURL(/\/e2e$/);
		expect(page.url()).toMatch(/\/e2e$/);
		await expect(page.getByTestId("url")).toContainText("URL: http://localhost:4321/e2e");
	});
});
