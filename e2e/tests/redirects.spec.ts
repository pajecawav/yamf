import { expect, test } from "@playwright/test";

test.describe("redirects", () => {
	test("returns 302 status and Location header", async ({ request }) => {
		const response = await request.get("/redirect", {
			maxRedirects: 0,
		});
		expect(response.status()).toBe(302);
		expect(response.headers().location).toBe("/");
	});

	test("browser follows redirect to /e2e", async ({ page }) => {
		await page.goto("/redirect");
		await page.waitForURL("/");
		expect(page.url()).toMatch("/");
		await expect(page.getByTestId("url")).toContainText("URL: http://localhost:4321");
	});
});
