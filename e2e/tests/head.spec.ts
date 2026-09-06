import { expect, test, type Page } from "@playwright/test";

// Title must be asserted from the SSR response body, not the live DOM:
// islands with useHead overwrite document.title right after hydration.
const ssrTitle = async (page: Page, path: string) => {
	const res = await page.goto(path, { waitUntil: "domcontentloaded" });
	const html = await res!.text();
	return html.match(/<title>(.*)<\/title>/)?.[1];
};

test.describe("head & metadata", () => {
	test("sets page title with titleTemplate", async ({ page }) => {
		expect(await ssrTitle(page, "")).toBe("YAMF Playground | playground");
	});

	test("titleTemplate appends | playground to all titles", async ({ page }) => {
		for (const path of ["", "/wouter", "/query", "/swr"]) {
			expect(await ssrTitle(page, path)).toMatch(/\| playground$/);
		}
	});

	test("useSeoMeta sets meta description", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"hello world",
		);
	});

	test("seo key in mid-render useHead is processed", async ({ page }) => {
		await page.goto("/seo-mid", { waitUntil: "domcontentloaded" });

		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"mid-render seo",
		);
		await expect(page).toHaveTitle("SEO mid | playground");
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
		expect(await ssrTitle(page, "")).toContain("YAMF Playground");
		expect(await ssrTitle(page, "/wouter")).toContain("testtest");
	});

	test("head tags are inside <head>", async ({ page }) => {
		await page.goto("", { waitUntil: "domcontentloaded" });
		expect(await page.locator("head title").count()).toBeGreaterThan(0);
		expect(await page.locator('head meta[name="description"]').count()).toBeGreaterThan(0);
	});
});

test.describe("head handshake (client-side)", () => {
	test("client-side title updates keep titleTemplate", async ({ page }) => {
		await page.goto("", { waitUntil: "networkidle" });

		// the withTitle island overwrites the title on hydration; the server
		// entry titleTemplate ("%s | playground") must survive that update
		await expect(page).toHaveTitle("Counter: 7 | playground");
	});

	test("streamed head patches are applied on the client", async ({ page }) => {
		await page.goto("/head-stream", { waitUntil: "networkidle" });

		// the async island pushes its title via a streamed patch script after
		// the shell; the client head must drain the patch queue and apply it
		await expect(page).toHaveTitle("Counter: 30 | playground");
	});

	test("useHead does not accumulate entries on re-renders", async ({ page }) => {
		await page.goto("", { waitUntil: "networkidle" });

		const last = page.locator("yamf-island button").last();
		await last.click();
		await expect(page).toHaveTitle("Counter: 8 | playground");

		const count = () => page.evaluate(() => window.__yamfHead__?.entries.size ?? -1);

		const initial = await count();

		for (let i = 0; i < 10; i++) {
			await last.click();
		}

		const after = await count();

		// the count includes server-side handshake entries; what must not
		// happen is growth: re-renders patch the island's entry in place
		// instead of pushing a new one on every render
		expect(after).toBe(initial);
	});
});
