import { expect, test } from "@playwright/test";

test.describe("error handling", () => {
	test("returns 500 for route that throws", async ({ request }) => {
		const response = await request.get("/e2e/error");
		expect(response.status()).toBe(500);
	});

	test("response body matches custom handler format", async ({ request }) => {
		const response = await request.get("/e2e/error");
		const text = await response.text();
		expect(text).toContain("500");
		expect(text).toContain("Something went wrong");
	});

	test("returns 404 for unknown route", async ({ request }) => {
		const response = await request.get("/e2e/nonexistent");
		expect(response.status()).toBe(404);
	});

	test("404 returns error response, not HTML page", async ({ request }) => {
		const response = await request.get("/e2e/nonexistent");
		const text = await response.text();
		expect(text).not.toContain("<!doctype html>");
		expect(text.length).toBeGreaterThan(0);
	});
});
