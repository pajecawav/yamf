import type { IslandProps } from "@pajecawav/yamf";

export interface PropsDemoProps extends IslandProps {
	date: Date;
	map: Map<string, number>;
	set: Set<string>;
	url: URL;
	regex: RegExp;
	bigint: bigint;
}

export const PropsDemo = (props: PropsDemoProps) => {
	return (
		<div data-testid="props-demo">
			<span data-testid="date">{props.date.toISOString()}</span>
			<span data-testid="map">{JSON.stringify([...props.map.entries()])}</span>
			<span data-testid="set">{JSON.stringify([...props.set])}</span>
			<span data-testid="url">{props.url.href}</span>
			<span data-testid="regex">{props.regex.source}</span>
			<span data-testid="bigint">{props.bigint.toString()}</span>
		</div>
	);
};
