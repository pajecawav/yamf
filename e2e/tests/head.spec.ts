import { expect, test } from "@playwright/test";

test.describe("head & metadata", () => {
	test("sets page title with titleTemplate", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		await expect(page).toHaveTitle("YAMF Playground | playground");
	});

	test("titleTemplate appends | playground to all titles", async ({ page }) => {
		for (const path of ["", "/wouter", "/query", "/swr"]) {
			await page.goto(path, { waitUntil: "domcontentloaded" });
			expect(await page.title()).toMatch(/\| playground$/);
		}
	});

	test("useSeoMeta sets meta description", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"hello world",
		);
	});

	test("bodyAttrs — home page has body class", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		await expect(page.locator("body")).toHaveClass(/tteesstt/);
	});

	test("head includes stylesheet links", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		expect(await page.locator('link[rel="stylesheet"]').count()).toBeGreaterThanOrEqual(1);
	});

	test("head includes client entry script", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		await expect(page.locator('head script[type="module"]')).toHaveCount(1);
	});

	test("page-specific title overrides server entry default", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toContain("YAMF Playground");

		await page.goto("/wouter", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toContain("testtest");
	});

	test("head tags are inside <head>", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		expect(await page.locator("head title").count()).toBeGreaterThan(0);
		expect(await page.locator('head meta[name="description"]').count()).toBeGreaterThan(0);
	});
});
