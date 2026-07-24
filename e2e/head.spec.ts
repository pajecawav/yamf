import { expect, test } from "@playwright/test";

test.describe("head & metadata", () => {
	test("sets page title with titleTemplate", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page).toHaveTitle("YAMF Playground | playground");
	});

	test("calc page title reflects island useHead", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
		await expect(page).toHaveTitle("2 * 7 = 14 | playground");
	});

	test("titleTemplate appends | playground to all titles", async ({ page }) => {
		for (const path of ["/e2e", "/e2e/calc", "/e2e/wouter", "/e2e/query", "/e2e/swr"]) {
			await page.goto(path, { waitUntil: "domcontentloaded" });
			expect(await page.title()).toMatch(/\| playground$/);
		}
	});

	test("useSeoMeta sets meta description", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"hello world",
		);
	});

	test("bodyAttrs — home page has body class", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator("body")).toHaveClass(/tteesstt/);
	});

	test("bodyAttrs — calc page does not have test body class", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "domcontentloaded" });
		const cls = (await page.locator("body").getAttribute("class")) ?? "";
		expect(cls).not.toContain("tteesstt");
	});

	test("head includes stylesheet links", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.locator('link[rel="stylesheet"]').count()).toBeGreaterThanOrEqual(1);
	});

	test("head includes client entry script", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		await expect(page.locator('head script[type="module"]')).toHaveCount(1);
	});

	test("Calc island updates title when input changes", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "networkidle" });
		await page.locator('input[type="number"]').first().fill("10");
		await expect(page).toHaveTitle(/10 \* 7 = 70/);
	});

	test("title reverts when input changes back", async ({ page }) => {
		await page.goto("/e2e/calc", { waitUntil: "networkidle" });
		await page.locator('input[type="number"]').first().fill("3");
		await expect(page).toHaveTitle(/3 \* 7 = 21/);
	});

	test("page-specific title overrides server entry default", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toContain("YAMF Playground");

		await page.goto("/e2e/wouter", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toContain("testtest");
	});

	test("head tags are inside <head>", async ({ page }) => {
		await page.goto("/e2e", { waitUntil: "domcontentloaded" });
		expect(await page.locator("head title").count()).toBeGreaterThan(0);
		expect(await page.locator('head meta[name="description"]').count()).toBeGreaterThan(0);
	});
});
