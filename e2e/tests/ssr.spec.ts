import { expect, test } from "@playwright/test";

test.describe("SSR", () => {
	test("returns 200 with text/html content type", async ({ page }) => {
		const response = await page.goto("/e2e");
		expect(response?.status()).toBe(200);
		expect(response?.headers()["content-type"]).toContain("text/html");
	});

	test("renders islands in SSR output", async ({ page }) => {
		await page.goto("/e2e");
		expect(await page.locator("yamf-island").count()).toBe(3);
	});

	test("event.url accessible in render", async ({ page }) => {
		await page.goto("/e2e");
		await expect(page.getByTestId("url")).toContainText("URL: http://localhost:4321/e2e");
	});

	test.describe("file routing", () => {
		test("nested index at /e2e/wouter", async ({ page }) => {
			await page.goto("/e2e/wouter");
			await expect(page.locator('input[name="q"]')).toBeVisible();
		});

		test("param route [id]", async ({ page }) => {
			await page.goto("/e2e/params/42");
			await expect(page.getByTestId("param-id")).toHaveText("42");
		});

		test("404 for unknown route", async ({ request }) => {
			const response = await request.get("/e2e/nonexistent");
			expect(response.status()).toBe(404);
		});
	});

	test("non-streaming page returns complete HTML", async ({ page }) => {
		await page.goto("/e2e/islands");
		await expect(page.getByTestId("load")).toContainText("1");
	});

	test("content visible before JS executes", async ({ page }) => {
		await page.goto("/e2e/islands");
		await expect(page.getByTestId("visible")).toContainText("4");
	});
});
