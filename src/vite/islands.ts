// reference https://github.com/hi-ogawa/vite-plugin-fullstack/blob/28e9540a68529c58842e9a3bf17d2193a065d524/examples/island/src/framework/island/plugin.ts
import { withMagicString } from "rolldown-string";
import type { ParserOptions, Plugin } from "vite";
import { Visitor } from "vite";

const ISLAND_REGEX = /\.island\.(j|t)sx?$/;

// inits that can plausibly evaluate to a component; anything else (object,
// array, literal, class…) is left as a plain export with a warning
const WRAPPABLE_INIT_TYPES = new Set([
	"ArrowFunctionExpression",
	"FunctionExpression",
	"CallExpression",
	"OptionalCallExpression",
	"Identifier",
	"ConditionalExpression",
	"SequenceExpression",
	"TSAsExpression",
	"NonNullExpression",
]);

const isWrappableInit = (init: { type: string }): boolean => {
	return WRAPPABLE_INIT_TYPES.has(init.type);
};

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
					const warnings: string[] = [];

					new Visitor({
						ExportDefaultDeclaration(node) {
							const declaration = node.declaration;
							if (
								declaration.type !== "FunctionDeclaration" &&
								declaration.type !== "FunctionExpression" &&
								declaration.type !== "ArrowFunctionExpression"
							) {
								warnings.push(
									`${id}: export default <${declaration.type === "Identifier" ? "identifier" : declaration.type}> is not wrapped as an island — only function components are supported`,
								);
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

							if (!declaration) {
								if (node.exportKind !== "type") {
									warnings.push(
										`${id}: export { … } statements are not wrapped as islands — export the component with \`export const\` or \`export function\``,
									);
								}
								return;
							}

							if (declaration.type === "VariableDeclaration") {
								const declarators = declaration.declarations;
								const declarator = declarators[0];

								if (
									!declarator ||
									declarator.id.type !== "Identifier" ||
									!declarator.init ||
									seenExports.has(declarator.id.name)
								) {
									return;
								}

								const exportName = declarator.id.name;

								if (!isWrappableInit(declarator.init)) {
									warnings.push(
										`${id}: export "${exportName}" does not look like a component — left as a plain export, not an island`,
									);
									return;
								}

								if (declarators.length > 1) {
									warnings.push(
										`${id}: only the first declarator of a multi-declarator export is wrapped as an island ("${exportName}") — split the declaration`,
									);
								}

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
							} else if (declaration.type === "FunctionDeclaration") {
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

					for (const warning of warnings) {
						this.warn(warning);
					}
				}),
			},
		},
		{
			name: "yamf:islands:raw-import",
			transform: {
				order: "post",
				handler: withMagicString(function (s) {
					// the token is namespaced to avoid colliding with user code
					if (s.original.includes("__yamf_raw_import__")) {
						s.replaceAll("__yamf_raw_import__", "import");
					}
				}),
			},
		},
	];
};
