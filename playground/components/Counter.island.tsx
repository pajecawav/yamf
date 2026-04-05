import { createSignal } from "solid-js";

export interface CounterProps {
	initialValue?: number;
}

export default function Counter(props: CounterProps) {
	const [value, setValue] = createSignal(props.initialValue ?? 0);

	return <button onClick={() => setValue(value() + 1)}>{value()}</button>;
}
