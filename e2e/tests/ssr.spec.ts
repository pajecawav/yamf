import { expect, test } from "@playwright/test";

test.describe("SSR", () => {
	test("returns 200 with text/html content type", async ({ page }) => {
		const response = await page.goto("");
		expect(response?.status()).toBe(200);
		expect(response?.headers()["content-type"]).toContain("text/html");
	});

	test("renders islands in SSR output", async ({ page }) => {
		await page.goto("");
		expect(await page.locator("yamf-island").count()).toBe(3);
	});

	test("event.url accessible in render", async ({ page }) => {
		await page.goto("");
		await expect(page.getByTestId("url")).toContainText("URL: http://localhost:4321");
	});

	test.describe("file routing", () => {
		test("nested route", async ({ page }) => {
			await page.goto("/this/is/nested");
			await expect(page.getByTestId("nested")).toBeVisible();
		});

		test("param route [id]", async ({ page }) => {
			await page.goto("/params/42");
			await expect(page.getByTestId("param-id")).toHaveText("42");
		});

		test("404 for unknown route", async ({ request }) => {
			const response = await request.get("/nonexistent");
			expect(response.status()).toBe(404);
		});
	});

	test("non-streaming page returns complete HTML", async ({ page }) => {
		await page.goto("/islands");
		await expect(page.getByTestId("load")).toContainText("1");
	});

	test("content visible before JS executes", async ({ page }) => {
		await page.goto("/islands");
		await expect(page.getByTestId("visible")).toContainText("4");
	});
});
