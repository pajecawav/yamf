import { createSignal } from "solid-js";
import styles from "./Counter.module.css";

export interface CounterProps {
	initialValue?: number;
}

export default function Counter(props: CounterProps) {
	const [value, setValue] = createSignal(props.initialValue ?? 0);

	return (
		<button class={styles.counter} onClick={() => setValue(value() + 1)}>
			{value()}
		</button>
	);
}
