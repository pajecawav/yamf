import { expect, test } from "@playwright/test";

test.describe("wouter integration", () => {
	test("renders wouter island with SSR output", async ({ page }) => {
		await page.goto("/e2e/wouter", { waitUntil: "domcontentloaded" });
		await expect(page.locator('yamf-island[island-entry="WouterDemo"]')).toBeVisible();
		await expect(page.locator('input[name="q"]')).toBeVisible();
		await expect(page.locator('input[name="v"]')).toBeVisible();
	});

	test("renders empty params on initial load", async ({ page }) => {
		await page.goto("/e2e/wouter", { waitUntil: "domcontentloaded" });
		await expect(page.locator('input[name="q"]')).toHaveValue("");
	});

	test("renders params from URL on SSR", async ({ page }) => {
		await page.goto("/e2e/wouter?q=hello&v=42", {
			waitUntil: "domcontentloaded",
		});
		await expect(page.locator('input[name="q"]')).toHaveValue("hello");
		await expect(page.locator('input[name="v"]')).toHaveValue("42");
	});

	test("reads params from URL after navigation", async ({ page }) => {
		await page.goto("/e2e/wouter?q=test&v=99", {
			waitUntil: "networkidle",
		});
		await expect(page.locator('input[name="q"]')).toHaveValue("test");
		await expect(page.locator('input[name="v"]')).toHaveValue("99");
	});

	test("updates URL when typing in inputs", async ({ page }) => {
		await page.goto("/e2e/wouter", { waitUntil: "networkidle" });
		await page.locator('input[name="q"]').fill("searchterm");
		await page.waitForURL(/q=searchterm/);
		expect(page.url()).toContain("q=searchterm");
	});

	test("updates multiple params independently", async ({ page }) => {
		await page.goto("/e2e/wouter", { waitUntil: "networkidle" });
		await page.locator('input[name="q"]').fill("abc");
		await page.locator('input[name="v"]').fill("123");
		await page.waitForURL(/q=abc/);
		await page.waitForURL(/v=123/);
		expect(page.url()).toContain("q=abc");
		expect(page.url()).toContain("v=123");
	});
});

test.describe("React alias — react-query", () => {
	test("renders loading state in SSR", async ({ page }) => {
		await page.goto("/e2e/query", { waitUntil: "domcontentloaded" });
		await expect(page.locator("pre")).toHaveText("loading...");
	});

	test("fetches and displays data after hydration", async ({ page }) => {
		await page.goto("/e2e/query", { waitUntil: "domcontentloaded" });

		await page.waitForFunction(
			() => {
				const pre = document.querySelector("pre");
				return pre && !pre.textContent?.includes("loading...");
			},
			{ timeout: 15_000 },
		);
		const text = await page.locator("pre").textContent();
		expect(text).toBeTruthy();
		expect(text).not.toContain("loading...");
	});
});

test.describe("React alias — swr", () => {
	test("renders loading state in SSR", async ({ page }) => {
		await page.goto("/e2e/swr", { waitUntil: "domcontentloaded" });
		await expect(page.locator("pre")).toHaveText("loading...");
	});

	test("fetches and displays data after hydration", async ({ page }) => {
		await page.goto("/e2e/swr", { waitUntil: "domcontentloaded" });

		await page.waitForFunction(
			() => {
				const pre = document.querySelector("pre");
				return pre && !pre.textContent?.includes("loading...");
			},
			{ timeout: 15_000 },
		);
		const text = await page.locator("pre").textContent();
		expect(text).toBeTruthy();
		expect(text).not.toContain("loading...");
	});
});

test("wouter hooks work inside island (proves react alias)", async ({ page }) => {
	await page.goto("/e2e/wouter?q=aliased&v=1", {
		waitUntil: "networkidle",
	});
	await expect(page.locator('input[name="q"]')).toHaveValue("aliased");
});
