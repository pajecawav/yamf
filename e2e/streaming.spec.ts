import { expect, test } from "@playwright/test";

test.describe("SSR streaming", () => {
	test("home page uses chunked transfer encoding", async ({ request }) => {
		const response = await request.get("/e2e");
		expect(response.headers()["transfer-encoding"]).toBe("chunked");
	});

	test("streaming page shows fallback then resolves content", async ({ page }) => {
		await page.goto("/e2e/streaming", { waitUntil: "commit" });

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
		const response = await request.get("/e2e/islands");
		const text = await response.text();
		expect(text).toContain("<!doctype html>");
		expect(text).toContain("</html>");
	});

	test("suspense fallbacks in initial HTML", async ({ page }) => {
		await page.goto("/e2e/streaming", { waitUntil: "commit" });
		await expect(page.getByText("Loading 1...")).toBeVisible({
			timeout: 2000,
		});
	});

	test("stream contains replacement scripts", async ({ request }) => {
		const response = await request.get("/e2e/streaming");
		const html = await response.text();
		expect(html).toContain("data-hono-target");
		expect(html).toContain("replaceWith");
	});

	test("async content values appear after resolution", async ({ page }) => {
		await page.goto("/e2e/streaming", { waitUntil: "networkidle" });

		const buttons = page.locator("yamf-island button");
		const texts = await buttons.allTextContents();
		expect(texts).toContain("10");
		expect(texts).toContain("20");
	});
});
