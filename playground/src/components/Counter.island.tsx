import { useState } from "hono/jsx";
import { useHead } from "yamf";
import styles from "./Counter.module.css";

export interface CounterProps {
	initialValue?: number;
	withTitle?: boolean;
}

export default function Counter(props: CounterProps) {
	const [value, setValue] = useState(props.initialValue ?? 0);

	useHead(props.withTitle ? { title: `Counter: ${value}` } : undefined);

	return (
		<button class={styles.counter} onClick={() => setValue(value + 1)}>
			{value}
		</button>
	);
}
