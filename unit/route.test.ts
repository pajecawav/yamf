import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filePathToRoute } from "../src/server/route.ts";

describe("filePathToRoute", () => {
	it("maps index to the root route", () => {
		assert.equal(filePathToRoute("/src/pages/index.page.tsx"), "/");
	});

	it("maps a flat page", () => {
		assert.equal(filePathToRoute("/src/pages/about.page.tsx"), "/about");
	});

	it("maps a nested page and strips a nested index", () => {
		assert.equal(filePathToRoute("/src/pages/post/[postId].page.tsx"), "/post/:postId");
		assert.equal(filePathToRoute("/src/pages/guide/index.page.tsx"), "/guide");
		assert.equal(
			filePathToRoute("/src/pages/shop/[category]/[id].page.tsx"),
			"/shop/:category/:id",
		);
	});

	it("sanitizes non-word chars in param names", () => {
		assert.equal(filePathToRoute("/src/pages/[my-id].page.tsx"), "/:my_id");
	});

	it("strips group segments", () => {
		assert.equal(filePathToRoute("/src/pages/(marketing)/about.page.tsx"), "/about");
		assert.equal(filePathToRoute("/src/pages/(a)/nested/(b)/deep.page.tsx"), "/nested/deep");
	});

	it("maps catch-all segments", () => {
		assert.equal(filePathToRoute("/src/pages/docs/[...rest].page.tsx"), "/docs/**:rest");
		assert.equal(filePathToRoute("/src/pages/docs/[...].page.tsx"), "/docs/**");
		assert.equal(
			filePathToRoute("/src/pages/files/[...my-path].page.tsx"),
			"/files/**:my_path",
		);
	});

	it("handles non-tsx extensions", () => {
		assert.equal(filePathToRoute("/src/pages/plain.page.js"), "/plain");
		assert.equal(filePathToRoute("/src/pages/doc.page.mdx"), "/doc");
	});

	it("keeps numeric routes", () => {
		assert.equal(filePathToRoute("/src/pages/404.page.tsx"), "/404");
	});
});
