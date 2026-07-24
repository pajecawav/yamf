import { expect, test } from "@playwright/test";

test.describe("SSR streaming", () => {
	test("home page uses chunked transfer encoding", async ({ request }) => {
		const response = await request.get("");
		expect(response.headers()["transfer-encoding"]).toBe("chunked");
	});

	test("streaming page shows fallback then resolves content", async ({ page }) => {
		await page.goto("/streaming", { waitUntil: "commit" });

		await expect(page.getByTestId("loading-1")).toBeVisible({
			timeout: 2000,
		});

		await expect(page.locator("yamf-island button")).toHaveCount(2, {
			timeout: 5000,
		});

		await expect(page.getByTestId("loading-1")).toHaveCount(0);
		await expect(page.getByTestId("loading-2")).toHaveCount(0);
	});

	test("non-streaming page sends complete response", async ({ request }) => {
		const response = await request.get("/islands");
		const text = await response.text();
		expect(text).toContain("<!doctype html>");
		expect(text).toContain("</html>");
	});

	test("suspense fallbacks in initial HTML", async ({ page }) => {
		await page.goto("/streaming", { waitUntil: "commit" });
		await expect(page.getByText("Loading 1...")).toBeVisible({
			timeout: 2000,
		});
	});

	test("async content values appear after resolution", async ({ page }) => {
		await page.goto("/streaming", { waitUntil: "networkidle" });

		const buttons = page.locator("yamf-island button");
		const texts = await buttons.allTextContents();
		expect(texts).toContain("10");
		expect(texts).toContain("20");
	});

	test("async content becomes interactive after loading", async ({ page }) => {
		await page.goto("/streaming", { waitUntil: "networkidle" });

		const button = page.locator("yamf-island button").first();
		await expect(button).toHaveText("10");

		await button.click();
		await expect(button).toHaveText("11");
	});
});
