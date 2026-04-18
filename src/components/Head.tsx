import { SSRContext } from "#/context/ssr";
import { useContext, type PropsWithChildren } from "hono/jsx";
import { clientAssets } from "virtual:yamf:assets";

export type HeadProps = PropsWithChildren;

export const Head = (props: HeadProps) => {
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
