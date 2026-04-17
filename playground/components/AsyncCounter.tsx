import { createResource } from "solid-js";
import { Island } from "yamf";
import Counter, { type CounterProps } from "./Counter.island";

export const AsyncCounter = (props: CounterProps) => {
	const [initialValue] = createResource(
		() =>
			new Promise<number | undefined>(resolve =>
				setTimeout(resolve, 2000, props.initialValue),
			),
	);

	return <Island Component={Counter} props={{ initialValue: initialValue() }} />;
};
