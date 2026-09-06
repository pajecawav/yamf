// reference https://github.com/hi-ogawa/vite-plugin-fullstack/blob/28e9540a68529c58842e9a3bf17d2193a065d524/examples/island/src/framework/island/plugin.ts
import { withMagicString } from "rolldown-string";
import type { ParserOptions, Plugin } from "vite";
import { Visitor } from "vite";

const ISLAND_REGEX = /\.island\.(j|t)sx?$/;

type Lang = NonNullable<ParserOptions["lang"]>;

function langFromId(id: string): Lang {
	if (id.endsWith(".tsx")) {
		return "tsx";
	}
	if (id.endsWith(".ts")) {
		return "ts";
	}
	if (id.endsWith(".jsx")) {
		return "jsx";
	}
	return "js";
}

export const islands = (): Plugin[] => {
	return [
		{
			name: "yamf:islands",
			transform: {
				filter: { id: ISLAND_REGEX },
				handler: withMagicString(function (this, s, id) {
					if (this.environment.name !== "ssr") {
						return;
					}

					const program = this.parse(s.original, {
						lang: langFromId(id),
					});

					// prepend server island runtime + asset imports:
					//   import * as __runtime from "@pajecawav/yamf/server";
					//   import __assets from "<id>?assets=client";
					s.prepend(`import * as __runtime from "@pajecawav/yamf/server";\n`);
					s.prepend(`import __assets from "${id}?assets=client";\n`);

					const seenExports = new Set<string>();

					new Visitor({
						ExportDefaultDeclaration(node) {
							const declaration = node.declaration;
							if (
								declaration.type !== "FunctionDeclaration" &&
								declaration.type !== "FunctionExpression" &&
								declaration.type !== "ArrowFunctionExpression"
							) {
								return;
							}

							// export default <fn> ->
							// const __ISLAND__ = <fn>; export default __runtime.createIsland(__ISLAND__, "default", __assets)
							s.overwrite(node.start, declaration.start, "const __ISLAND__ = ");
							s.appendRight(
								declaration.end,
								`; export default __runtime.createIsland(__ISLAND__, "default", __assets)`,
							);
						},
						ExportNamedDeclaration(node) {
							const declaration = node.declaration;
							if (declaration?.type === "VariableDeclaration") {
								const declarator = declaration.declarations[0];
								if (
									!declarator ||
									declarator.id.type !== "Identifier" ||
									!declarator.init ||
									seenExports.has(declarator.id.name)
								) {
									return;
								}
								const exportName = declarator.id.name;
								seenExports.add(exportName);

								// export const <name> = <init> ->
								// const __wrap_<name> = <init>; export const <name> = __runtime.createIsland(__wrap_<name>, "<name>", __assets)
								s.overwrite(
									node.start,
									declarator.init.start,
									`const __wrap_${exportName} = `,
								);
								s.appendRight(
									declarator.init.end,
									`; export const ${exportName} = __runtime.createIsland(__wrap_${exportName}, "${exportName}", __assets)`,
								);
							} else if (declaration?.type === "FunctionDeclaration") {
								const fnId = declaration.id;
								if (
									!fnId ||
									fnId.type !== "Identifier" ||
									seenExports.has(fnId.name)
								) {
									return;
								}
								const exportName = fnId.name;
								seenExports.add(exportName);

								// export function <name>() {} ->
								// function __wrap_<name>() {}; export const <name> = __runtime.createIsland(__wrap_<name>, "<name>", __assets)
								s.remove(node.start, declaration.start);
								s.overwrite(fnId.start, fnId.end, `__wrap_${exportName}`);
								s.appendRight(
									declaration.end,
									`; export const ${exportName} = __runtime.createIsland(__wrap_${exportName}, "${exportName}", __assets)`,
								);
							}
						},
					}).visit(program);
				}),
			},
		},
		{
			name: "yamf:islands:raw-import",
			transform: {
				order: "post",
				handler: withMagicString(function (s) {
					if (s.original.includes("__island_raw_import__")) {
						s.replaceAll("__island_raw_import__", "import");
					}
				}),
			},
		},
	];
};
