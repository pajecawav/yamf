import { expect, test } from "@playwright/test";

test.describe("safeAsync (mid-stream errors)", () => {
	test("rejecting async component renders fallback, not eternal loading", async ({ page }) => {
		await page.goto("/stream-error", { waitUntil: "networkidle" });

		await expect(page.getByTestId("error-fallback")).toBeVisible();
		await expect(page.getByTestId("loading")).toHaveCount(0);
	});

	test("page still returns 200 with shell content", async ({ request }) => {
		const response = await request.get("/stream-error");
		expect(response.status()).toBe(200);
	});
});
