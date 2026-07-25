import { expect, test } from "@playwright/test";

const getButton = (page: import("@playwright/test").Page, testid: string) =>
	page.locator(`[data-testid="${testid}"] button`);

test.describe("islands — hydration directives", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/islands", { waitUntil: "networkidle" });
	});

	test("load (default) hydrates and is interactive", async ({ page }) => {
		const btn = getButton(page, "load");
		await expect(btn).toHaveText("1");
		await btn.click();
		await expect(btn).toHaveText("2");
		await btn.click();
		await expect(btn).toHaveText("3");
	});

	test("load (explicit) hydrates and is interactive", async ({ page }) => {
		const btn = getButton(page, "load-explicit");
		await expect(btn).toHaveText("2");
		await btn.click();
		await expect(btn).toHaveText("3");
	});

	test("idle eventually hydrates and becomes interactive", async ({ page }) => {
		const btn = getButton(page, "idle");
		await expect(btn).toHaveText("3");
		await btn.click();
		await expect(btn).toHaveText("4");
	});

	test("visible hydrates when in view and becomes interactive", async ({ page }) => {
		const btn = getButton(page, "visible");
		await expect(btn).toHaveText("4");
		await btn.scrollIntoViewIfNeeded();
		await btn.click();
		await expect(btn).toHaveText("5");
	});

	test("skip renders SSR content but never hydrates", async ({ page }) => {
		const btn = getButton(page, "skip");
		await expect(btn).toHaveText("5");
		await btn.click();
		await expect(btn).toHaveText("5");
	});
});

test.describe("islands — SSR attributes", () => {
	test("renders all islands with correct entry names", async ({ page }) => {
		await page.goto("/islands", { waitUntil: "domcontentloaded" });
		await expect(page.locator('yamf-island[island-entry="Counter"]')).toHaveCount(5);
	});

	test("skip island has island-client='skip' attribute", async ({ page }) => {
		await page.goto("/islands", { waitUntil: "domcontentloaded" });
		await expect(page.locator('yamf-island[island-client="skip"]')).toHaveCount(1);
	});

	test("yamf-island has display:contents style", async ({ page }) => {
		await page.goto("/islands", { waitUntil: "domcontentloaded" });
		const island = page.locator("yamf-island").first();
		const style = await island.getAttribute("style");
		expect(style).toContain("display:contents");
	});
});

test.describe("islands — multiple islands independence", () => {
	test("home page islands are independently interactive", async ({ page }) => {
		await page.goto("", { waitUntil: "networkidle" });

		const buttons = page.locator("yamf-island button");
		expect(await buttons.count()).toBeGreaterThanOrEqual(3);

		const first = buttons.nth(0);
		await expect(first).toHaveText("1");
		await first.click();
		await expect(first).toHaveText("2");

		const second = buttons.nth(2);
		await expect(second).toHaveText("7");
		await second.click();
		await expect(second).toHaveText("8");
	});
});

test.describe("islands — named vs default exports", () => {
	test("named export islands have correct entry attribute", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		expect(
			await page.locator('yamf-island[island-entry="Counter"]').count(),
		).toBeGreaterThanOrEqual(1);
	});

	test("default export island has entry='default'", async ({ page }) => {
		await page.goto("/islands", { waitUntil: "domcontentloaded" });
		await expect(page.locator('yamf-island[island-entry="default"]')).toBeVisible();
	});
});

test.describe("islands — props serialization (devalue)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/props", { waitUntil: "networkidle" });
	});

	test("Date round-trips correctly", async ({ page }) => {
		await expect(page.getByTestId("date")).toHaveText("2024-01-15T12:30:00.000Z");
	});

	test("Map round-trips correctly", async ({ page }) => {
		const text = await page.getByTestId("map").textContent();
		expect(text).toContain("a");
		expect(text).toContain("1");
		expect(text).toContain("b");
		expect(text).toContain("2");
	});

	test("Set round-trips correctly", async ({ page }) => {
		const text = await page.getByTestId("set").textContent();
		expect(text).toContain("x");
		expect(text).toContain("y");
		expect(text).toContain("z");
	});

	test("URL round-trips correctly", async ({ page }) => {
		await expect(page.getByTestId("url")).toHaveText("https://example.com/test");
	});

	test("RegExp round-trips correctly", async ({ page }) => {
		await expect(page.getByTestId("regex")).toHaveText("hello");
	});

	test("BigInt round-trips correctly", async ({ page }) => {
		await expect(page.getByTestId("bigint")).toHaveText("999");
	});
});

test.describe("islands — useHead in islands (client-side)", () => {
	test("Counter with withTitle updates title on click", async ({ page }) => {
		await page.goto("", { waitUntil: "networkidle" });

		const buttons = page.locator("yamf-island button");
		const last = buttons.last();
		await expect(last).toHaveText("7");

		await last.click();
		await expect(page).toHaveTitle(/Counter: 8/);
	});
});
