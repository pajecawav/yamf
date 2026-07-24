import { expect, test } from "@playwright/test";

test.describe("API routes", () => {
	test("returns 200", async ({ request }) => {
		const response = await request.get("/e2e/hello");
		expect(response.status()).toBe(200);
	});

	test("returns correct body", async ({ request }) => {
		const response = await request.get("/e2e/hello");
		expect(await response.text()).toBe("hello");
	});

	test("returns text content type", async ({ request }) => {
		const response = await request.get("/e2e/hello");
		expect(response.headers()["content-type"]).toContain("text/plain");
	});

	test("returns 500 for route that throws", async ({ request }) => {
		const response = await request.get("/e2e/error");
		expect(response.status()).toBe(500);
	});

	test("error handled by custom error handler", async ({ request }) => {
		const response = await request.get("/e2e/error");
		const text = await response.text();
		expect(text).toContain("500");
		expect(text).toContain("Something went wrong");
	});

	test("API routes return text, not HTML", async ({ request }) => {
		const response = await request.get("/e2e/hello");
		expect(await response.text()).not.toContain("<!doctype html>");
	});

	test("page routes return HTML", async ({ page }) => {
		await page.goto("/e2e");
		expect(await page.evaluate(() => document.doctype?.name ?? null)).toBe("html");
	});
});
