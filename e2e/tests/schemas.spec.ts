import { expect, test } from "@playwright/test";

test.describe("definePage params/query schemas (standard-schema)", () => {
	test("validated values are passed to render", async ({ page }) => {
		await page.goto("/params-schema/42?page=2");

		await expect(page.getByTestId("schema-values")).toHaveText("42:2");
	});

	test("defaults from the schema apply", async ({ page }) => {
		await page.goto("/params-schema/7");

		await expect(page.getByTestId("schema-values")).toHaveText("7:1");
	});

	test("invalid path params produce 404", async ({ request }) => {
		const res = await request.get("/params-schema/not-a-number");

		expect(res.status()).toBe(404);
	});

	test("invalid query produces 400", async ({ request }) => {
		const res = await request.get("/params-schema/42?page=nope");

		expect(res.status()).toBe(400);
	});
});
