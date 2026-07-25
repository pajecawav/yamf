import { Counter, type CounterProps } from "./Counter.island";

interface AsyncCounterProps extends CounterProps {
	delay?: number;
}

export const AsyncCounter = async (props: AsyncCounterProps) => {
	await new Promise<number | undefined>(resolve =>
		setTimeout(resolve, props.delay ?? 2000, props.initialValue),
	);

	return <Counter {...props} />;
};
