import { createResource } from "solid-js";
import Counter, { type CounterProps } from "./Counter.island";

interface AsyncCounterProps extends CounterProps {
	delay?: number;
}

export const AsyncCounter = (props: AsyncCounterProps) => {
	const [initialValue] = createResource(
		() =>
			new Promise<number | undefined>(resolve =>
				setTimeout(resolve, props.delay ?? 2000, props.initialValue),
			),
	);

	return <Counter initialValue={initialValue()} />;
};
