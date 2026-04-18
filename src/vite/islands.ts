// reference https://github.com/hi-ogawa/vite-plugin-fullstack/blob/28e9540a68529c58842e9a3bf17d2193a065d524/examples/island/src/framework/island/plugin.ts
import { generate } from "@babel/generator";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import {
	callExpression,
	exportDefaultDeclaration,
	functionExpression,
	identifier,
	importDeclaration,
	importDefaultSpecifier,
	importNamespaceSpecifier,
	memberExpression,
	stringLiteral,
	variableDeclaration,
	variableDeclarator,
} from "@babel/types";
import type { Plugin } from "vite";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const traverse = (_traverse.default as typeof _traverse) ?? _traverse;

const ISLAND_REGEX = /\.island\.(j|t)sx?$/;

export const islands = (): Plugin[] => {
	return [
		{
			name: "yamf:islands",
			// enforce: "pre",
			transform: {
				filter: { id: ISLAND_REGEX },
				handler(code, id) {
					if (this.environment.name !== "ssr") {
						return;
					}

					const ast = parse(code, {
						sourceType: "module",
						plugins: ["typescript", "jsx"],
					});

					traverse(ast, {
						Program(path) {
							// prepends server island runtime
							// import * as __runtime from "yamf/server";
							path.unshiftContainer(
								"body",
								importDeclaration(
									[importNamespaceSpecifier(identifier("__runtime"))],
									stringLiteral("yamf/server"),
								),
							);

							// prepends asset imports for the island:
							// import __assets from "MODULE_ID?assets=client";
							path.unshiftContainer(
								"body",
								importDeclaration(
									[importDefaultSpecifier(identifier("__assets"))],
									stringLiteral(`${id}?assets=client`),
								),
							);
						},
						// TODO: handle named exports
						ExportDefaultDeclaration(path) {
							const declarationType = path.node.declaration.type;

							if (
								!(
									declarationType === "FunctionDeclaration" ||
									declarationType === "FunctionExpression" ||
									declarationType === "ArrowFunctionExpression"
								)
							) {
								return;
							}

							const originalFunction =
								path.node.declaration.type === "FunctionExpression" ||
								path.node.declaration.type === "ArrowFunctionExpression"
									? path.node.declaration
									: functionExpression(
											null,
											path.node.declaration.params,
											path.node.declaration.body,
											undefined,
											path.node.declaration.async,
										);

							const islandIdentifier = identifier("__ISLAND__");

							path.insertBefore(
								variableDeclaration("const", [
									variableDeclarator(islandIdentifier, originalFunction),
								]),
							);

							path.replaceWith(
								exportDefaultDeclaration(
									callExpression(
										memberExpression(
											identifier("__runtime"),
											identifier("createIsland"),
										),
										[
											islandIdentifier,
											stringLiteral("default"),
											identifier("__assets"),
										],
									),
								),
							);
						},
					});

					const result = generate(ast);

					return { code: result.code, map: result.map };
				},
			},
		},
		{
			name: "yamf:islands:raw-import",
			transform: {
				order: "post",
				handler(code) {
					if (code.includes("__island_raw_import__")) {
						return code.replaceAll("__island_raw_import__", "import");
					}

					return undefined;
				},
			},
		},
	];
};
