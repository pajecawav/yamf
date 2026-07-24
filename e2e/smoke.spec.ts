import { expect, test } from "@playwright/test";

test("server returns HTML", async ({ page }) => {
	const response = await page.goto("/e2e");
	expect(response?.status()).toBe(200);
	expect(response?.headers()["content-type"]).toContain("text/html");
});

test("renders island content", async ({ page }) => {
	await page.goto("/e2e");
	const count = await page.locator("yamf-island").count();
	expect(count).toBeGreaterThanOrEqual(3);
});
