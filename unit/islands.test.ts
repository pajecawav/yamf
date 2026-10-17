import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSync, type ParserOptions, type TransformResult } from "vite";
import { islands } from "../src/vite/islands.ts";

const ISLAND_ID = "/src/Counter.island.tsx";

const getTransformHandler = (pluginIndex: number) => {
	const plugin = islands()[pluginIndex];

	assert.ok(plugin, "plugin exists");

	const transform = plugin.transform;

	assert.ok(transform, "transform hook exists");
	assert.ok(typeof transform === "object", "transform is the object form");

	return transform.handler;
};

interface RunResult {
	code: string;
	warnings: string[];
}

const parseProgram = (id: string, source: string, lang: ParserOptions["lang"]) => {
	// vite types the third argument as ParserOptions, but at runtime the
	// exported parseSync expects the lang string (it wraps rolldown's)
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	return parseSync(id, source, (lang ?? "tsx") as never).program;
};

const makeContext = (environment: string, id: string, warnings: string[]) => ({
	environment: { name: environment },
	parse: (source: string, options: ParserOptions) => parseProgram(id, source, options.lang),
	warn: (message: string) => {
		warnings.push(message);
	},
});

// the handlers are sync by construction (withMagicString wrappers)
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const callSync = (
	handler: ReturnType<typeof getTransformHandler>,
	ctx: unknown,
	code: string,
	id: string,
): TransformResult | undefined =>
	handler.call(ctx as never, code, id) as TransformResult | undefined;

const readCode = (result: TransformResult | undefined, original: string): string => {
	if (result === undefined) {
		return original;
	}

	if (typeof result === "string") {
		return result;
	}

	return result.code ?? original;
};

const runIslandsTransform = (code: string, id = ISLAND_ID): RunResult => {
	const warnings: string[] = [];
	const result = callSync(getTransformHandler(0), makeContext("ssr", id, warnings), code, id);

	return { code: readCode(result, code), warnings };
};

describe("yamf:islands transform", () => {
	it("wraps an exported arrow-function const", () => {
		const { code, warnings } = runIslandsTransform(
			"export const Counter = () => <div>hi</div>;",
		);

		assert.deepEqual(warnings, []);
		assert.match(code, /const __wrap_Counter = \(\) => <div>hi<\/div>;/);
		assert.match(
			code,
			/export const Counter = __runtime\.createIsland\(__wrap_Counter, "Counter", __assets\);/,
		);
	});

	it("wraps an exported function declaration", () => {
		const { code, warnings } = runIslandsTransform(
			"export function Counter() { return <div>hi</div>; }",
		);

		assert.deepEqual(warnings, []);
		assert.match(code, /function __wrap_Counter\(\) \{ return <div>hi<\/div>; \}/);
		assert.match(
			code,
			/export const Counter = __runtime\.createIsland\(__wrap_Counter, "Counter", __assets\)/,
		);
	});

	it("wraps a default-exported function", () => {
		const { code, warnings } = runIslandsTransform(
			"export default function Calc() { return <b>x</b>; }",
		);

		assert.deepEqual(warnings, []);
		assert.match(code, /const __ISLAND__ = function Calc\(\) \{ return <b>x<\/b>; \};/);
		assert.match(
			code,
			/export default __runtime\.createIsland\(__ISLAND__, "default", __assets\)/,
		);
	});

	it("wraps a default-exported arrow function", () => {
		const { code, warnings } = runIslandsTransform("export default () => <div>x</div>;");

		assert.deepEqual(warnings, []);
		assert.match(code, /const __ISLAND__ = \(\) => <div>x<\/div>;/);
	});

	it("wraps call-expression inits (e.g. memo(() => ...))", () => {
		const { code, warnings } = runIslandsTransform(
			"const memo = (fn) => fn;\nexport const Counter = memo(() => <div>hi</div>);",
		);

		assert.deepEqual(warnings, []);
		assert.match(code, /__runtime\.createIsland\(__wrap_Counter, "Counter", __assets\)/);
	});

	it("prepends the runtime and assets imports", () => {
		const { code } = runIslandsTransform("export const Counter = () => <div>hi</div>;");

		assert.match(code, /import \* as __runtime from "@pajecawav\/yamf\/server";/);
		assert.match(code, /import __assets from "\/src\/Counter\.island\.tsx\?assets=client";/);
	});

	it("warns on a non-function default export and leaves it alone", () => {
		const { code, warnings } = runIslandsTransform("export default 42;");

		assert.equal(warnings.length, 1);
		assert.match(warnings[0]!, /export default <Literal> is not wrapped/);
		assert.equal(
			code,
			'import __assets from "/src/Counter.island.tsx?assets=client";\nimport * as __runtime from "@pajecawav/yamf/server";\nexport default 42;',
		);
	});

	it("warns on export statements", () => {
		const { code, warnings } = runIslandsTransform(
			"const Counter = () => <div>hi</div>;\nexport { Counter };",
		);

		assert.equal(warnings.length, 1);
		assert.match(warnings[0]!, /export \{ … \} statements are not wrapped/);
		assert.doesNotMatch(code, /createIsland/);
	});

	it("warns on non-component const exports", () => {
		const { warnings } = runIslandsTransform("export const notAComponent = 42;");

		assert.equal(warnings.length, 1);
		assert.match(warnings[0]!, /export "notAComponent" does not look like a component/);
	});

	it("warns on multi-declarator exports and wraps only the first", () => {
		const { code, warnings } = runIslandsTransform(
			"export const A = () => <div>a</div>, B = () => <div>b</div>;",
		);

		assert.equal(warnings.length, 1);
		assert.match(warnings[0]!, /only the first declarator/);
		assert.match(code, /createIsland\(__wrap_A, "A", __assets\)/);
		assert.doesNotMatch(code, /__wrap_B/);
	});

	it("does not transform outside the ssr environment", () => {
		const warnings: string[] = [];
		const result = callSync(
			getTransformHandler(0),
			makeContext("client", ISLAND_ID, warnings),
			"export const Counter = () => <div>hi</div>;",
			ISLAND_ID,
		);

		assert.equal(result, undefined);
		assert.deepEqual(warnings, []);
	});
});

describe("yamf:islands:raw-import transform", () => {
	it("rewrites the namespaced import token back to import", () => {
		const result = callSync(
			getTransformHandler(1),
			undefined,
			'const load = () => __yamf_raw_import__("/src/x.js");',
			ISLAND_ID,
		);

		assert.equal(readCode(result, ""), 'const load = () => import("/src/x.js");');
	});

	it("leaves code without the token untouched", () => {
		const result = callSync(getTransformHandler(1), undefined, "const x = 1;", ISLAND_ID);

		assert.equal(result, undefined);
	});
});
