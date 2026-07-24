import { expect, test } from "@playwright/test";

test.describe("template.html", () => {
	test("contains template marker content", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator(".test")).toHaveText("template");
	});

	test("template content appears before SSR outlet", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator(".test")).toBeVisible();
		await expect(page.locator("yamf-island").first()).toBeAttached();

		const isBefore = await page.evaluate(() => {
			const testEl = document.querySelector(".test");
			const islandEl = document.querySelector("yamf-island");
			if (!testEl || !islandEl) return false;
			return (
				(testEl.compareDocumentPosition(islandEl) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
			);
		});
		expect(isBefore).toBe(true);
	});

	test("ssr-outlet is replaced with content", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.locator("yamf-island").count()).toBeGreaterThanOrEqual(3);
		await expect(page.locator('[class*="_layout_"]')).toBeVisible();
	});

	test("starts with doctype", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.evaluate(() => document.doctype?.name ?? null)).toBe("html");
	});

	test("has html, head, body structure", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator("html")).toBeVisible();
		await expect(page.locator("head")).toBeAttached();
		await expect(page.locator("body")).toBeVisible();
	});

	test("head tags injected by unhead inside <head>", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator("head title")).toHaveCount(1);
		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
	});

	test("template marker on all pages", async ({ page }) => {
		for (const path of ["/e2e", "/e2e/wouter"]) {
			await page.goto(path, { waitUntil: "domcontentloaded" });
			await expect(page.locator(".test")).toHaveText("template");
		}
	});
});
