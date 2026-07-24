import { expect, test } from "@playwright/test";

test.describe("SSR", () => {
	test("returns 200 with text/html content type", async ({ page }) => {
		const response = await page.goto("/e2e");
		expect(response?.status()).toBe(200);
		expect(response?.headers()["content-type"]).toContain("text/html");
	});

	test("renders islands in SSR output", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.locator("yamf-island").count()).toBeGreaterThanOrEqual(3);
	});

	test("event.url accessible in render", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator("body")).toContainText("URL: http://localhost:4321/e2e");
	});

	test("root layout wraps content", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator('[class*="_layout_"]')).toBeVisible();
	});

	test.describe("file routing", () => {
		test("index page at /e2e", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			await expect(page).toHaveTitle(/YAMF Playground/);
		});

		test("calc page at /e2e/calc", async ({ page }) => {
			await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
			await expect(page.locator('yamf-island[island-entry="default"]')).toBeVisible();
		});

		test("nested index at /e2e/wouter", async ({ page }) => {
			await page.goto("/e2e/wouter", { waitUntil: "domcontentloaded" });
			await expect(page.locator('yamf-island[island-entry="WouterDemo"]')).toBeVisible();
		});

		test("param route [id]", async ({ page }) => {
			await page.goto("/e2e/params/42", {
				waitUntil: "domcontentloaded",
			});
			await expect(page.getByTestId("param-id")).toHaveText("42");
		});

		test("404 for unknown route", async ({ request }) => {
			const response = await request.get("/e2e/nonexistent");
			expect(response.status()).toBe(404);
		});
	});

	test("non-streaming page returns complete HTML", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
		await expect(page.locator("body")).toContainText("= 14");
	});

	test("content visible before JS executes", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
		await expect(page.locator("yamf-island p")).toContainText("= 14");
	});

	test("multiple pages render correct content", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.locator("yamf-island").count()).toBeGreaterThanOrEqual(3);

		await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
		await expect(page.locator('yamf-island[island-entry="default"]')).toBeVisible();

		await page.goto("/e2e/wouter", { waitUntil: "domcontentloaded" });
		await expect(page.locator('input[name="q"]')).toBeVisible();
	});
});
