import { useState } from "hono/jsx";
import { useHead, type IslandProps } from "@pajecawav/yamf";
import styles from "./Counter.module.css";

export interface CounterProps extends IslandProps {
	initialValue?: number;
	withTitle?: boolean;
}

export const Counter = (props: CounterProps) => {
	const [value, setValue] = useState(props.initialValue ?? 0);

	useHead(props.withTitle ? { title: `Counter: ${value}` } : undefined);

	return (
		<button class={styles.counter} onClick={() => setValue(value + 1)}>
			{value}
		</button>
	);
};

export const Doubler = (props: CounterProps) => {
	const [value, setValue] = useState(props.initialValue ?? 0);

	return (
		<button class={styles.counter} onClick={() => setValue(value * 2)}>
			{value}
		</button>
	);
};

export function Tripler(props: CounterProps) {
	const [value, setValue] = useState(props.initialValue ?? 0);

	return (
		<button class={styles.counter} onClick={() => setValue(value * 3)}>
			{value}
		</button>
	);
}
