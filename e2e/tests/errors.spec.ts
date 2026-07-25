import { expect, test } from "@playwright/test";

test.describe("error handling", () => {
	test("returns 500 for native route that throws", async ({ request }) => {
		const response = await request.get("/error");
		expect(response.status()).toBe(500);
	});

	test("native route uses custom handler format", async ({ request }) => {
		const response = await request.get("/error");
		const text = await response.text();
		expect(text).toContain("500");
		expect(text).toContain("Something went wrong");
		// custom handler marker — proves the custom handler runs, not the nitro default
		expect(text).toMatch(/^yamf/);
	});

	test("returns 500 for yamf page that throws", async ({ request }) => {
		const response = await request.get("/throw");
		expect(response.status()).toBe(500);
	});

	test("yamf page uses custom handler format", async ({ request }) => {
		const response = await request.get("/throw");
		const text = await response.text();
		expect(text).toContain("500");
		expect(text).toContain("Something went wrong");
		// custom handler marker — proves the custom handler runs for yamf pages too
		expect(text).toMatch(/^yamf/);
	});

	test("returns 404 for unknown route", async ({ request }) => {
		const response = await request.get("/nonexistent");
		expect(response.status()).toBe(404);
	});

	test("404 uses custom handler format", async ({ request }) => {
		const response = await request.get("/nonexistent");
		const text = await response.text();
		expect(text).toContain("404");
		expect(text).toContain("yamf");
	});

	test("404 returns error response, not HTML page", async ({ request }) => {
		const response = await request.get("/nonexistent");
		const text = await response.text();
		expect(text).not.toContain("<!doctype html>");
		expect(text.length).toBeGreaterThan(0);
	});
});
