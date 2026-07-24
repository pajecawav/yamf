import { expect, test } from "@playwright/test";

test.describe("CSS styles", () => {
	test.describe("CSS modules — scoped class names", () => {
		test("Counter buttons have scoped class", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			const cls = await page.locator("yamf-island button").first().getAttribute("class");
			expect(cls).toMatch(/_counter_\w+/);
		});

		test("Container has scoped class", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			await expect(page.locator('[class*="_container_"]')).toBeVisible();
		});

		test("Root layout has scoped class", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			await expect(page.locator('[class*="_layout_"]')).toBeVisible();
		});
	});

	test.describe("CSS modules — computed styles", () => {
		test.beforeEach(async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "networkidle" });
		});

		test("counter text color is blue", async ({ page }) => {
			const color = await page
				.locator("yamf-island button")
				.first()
				.evaluate(el => getComputedStyle(el).color);
			expect(color).toBe("rgb(0, 0, 255)");
		});

		test("container has flex display", async ({ page }) => {
			const display = await page
				.locator('[class*="_container_"]')
				.first()
				.evaluate(el => getComputedStyle(el).display);
			expect(display).toBe("flex");
		});

		test("container has gap", async ({ page }) => {
			const gap = await page
				.locator('[class*="_container_"]')
				.first()
				.evaluate(el => getComputedStyle(el).gap);
			expect(gap).toBe("16px");
		});
	});

	test.describe("global CSS", () => {
		test("body has red border from global CSS", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "networkidle" });
			expect(await page.evaluate(() => getComputedStyle(document.body).borderWidth)).toBe(
				"5px",
			);
			expect(await page.evaluate(() => getComputedStyle(document.body).borderColor)).toBe(
				"rgb(255, 0, 0)",
			);
		});
	});

	test.describe("CSS link tags in head", () => {
		test("includes stylesheet links", async ({ page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			expect(await page.locator('link[rel="stylesheet"]').count()).toBeGreaterThanOrEqual(1);
		});

		test("CSS files are served successfully", async ({ request, page }) => {
			await page.goto("/e2e", { waitUntil: "domcontentloaded" });
			const hrefs = await page
				.locator('link[rel="stylesheet"]')
				.evaluateAll(els =>
					els.map(el => el.getAttribute("href")).filter((h): h is string => h !== null),
				);

			for (const href of hrefs) {
				const response = await request.get(href);
				expect(response.status()).toBe(200);
				expect((await response.text()).length).toBeGreaterThan(0);
			}
		});
	});
});
