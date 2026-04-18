import { SSRContext } from "#/context/ssr";
import type { PropsWithChildren } from "hono/jsx";
import { useContext } from "hono/jsx";
import type { JSX } from "hono/jsx/jsx-runtime";
import { clientAssets } from "virtual:yamf:assets";

export type HeadProps = PropsWithChildren;

export const Head = (props: HeadProps): JSX.Element => {
	const ctx = useContext(SSRContext);

	const assets = ctx?.serverAssets ? clientAssets.merge(ctx.serverAssets) : clientAssets;

	return (
		<head>
			{props.children}
			{assets.css.map(attrs => (
				<link rel="stylesheet" {...attrs} />
			))}
			{assets.js.map(attrs => (
				<link type="modulepreload" {...attrs} />
			))}
			<script type="module" src={assets.entry} />
		</head>
	);
};
