import { expect, test } from "@playwright/test";

test.describe("definePage cache option", () => {
	test("number shorthand sets public max-age", async ({ request }) => {
		const res = await request.get("/cached");

		expect(res.ok()).toBeTruthy();
		expect(res.headers()["cache-control"]).toBe("public, max-age=120");
	});

	test("object form sets swr and private", async ({ request }) => {
		const res = await request.get("/cached-private");

		expect(res.ok()).toBeTruthy();
		expect(res.headers()["cache-control"]).toBe(
			"private, max-age=60, stale-while-revalidate=10",
		);
	});

	test("pages without the option send no cache-control", async ({ request }) => {
		const res = await request.get("/error-boundary");

		expect(res.ok()).toBeTruthy();
		expect(res.headers()["cache-control"]).toBeUndefined();
	});
});
