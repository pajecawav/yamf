import type { ParentProps } from "solid-js";
import { HydrationScript } from "solid-js/web";
import { clientAssets as assets } from "virtual:yamf:assets";

export type HeadProps = ParentProps;

export const Head = (props: HeadProps) => {
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
			<HydrationScript />
		</head>
	);
};
