import { expect, test } from "@playwright/test";

test.describe("island runtime loading", () => {
	test("runtime is not loaded on pages without islands", async ({ page }) => {
		await page.goto("/error-boundary", { waitUntil: "networkidle" });

		// the custom element must be defined by the tiny bootstrap…
		expect(await page.evaluate(() => typeof customElements.get("yamf-island"))).toBe(
			"function",
		);

		// …but the full runtime (unhead client included) must not load when
		// the page has no islands to hydrate
		expect(await page.evaluate(() => window.__yamfHead__)).toBeUndefined();
	});

	test("runtime loads and hydrates when islands are present", async ({ page }) => {
		await page.goto("", { waitUntil: "networkidle" });

		expect(await page.evaluate(() => window.__yamfHead__)).toBeDefined();

		const last = page.locator("yamf-island button").last();
		await last.click();
		await expect(last).toHaveText("8");
	});

	test("skip islands do not serialize props", async ({ request }) => {
		const res = await request.get("/skip-island");

		expect(res.ok()).toBeTruthy();

		const html = await res.text();

		// server-rendered children stay…
		expect(html).toContain(">9</button>");

		// …but the props are dead weight for a client that never hydrates
		expect(html).not.toContain("island-props");
	});
});
