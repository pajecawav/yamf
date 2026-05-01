import { useState } from "hono/jsx";
import { useHead } from "@pajecawav/yamf";

export default function Calc() {
	const [a, setA] = useState(2);
	const [b, setB] = useState(7);

	useHead({ title: `${a} * ${b} = ${a * b}` });

	return (
		<p>
			<input
				type="number"
				value={a}
				onInput={e => setA((e.target as HTMLInputElement).valueAsNumber)}
			/>{" "}
			*
			<input
				type="number"
				value={b}
				onInput={e => setB((e.target as HTMLInputElement).valueAsNumber)}
			/>{" "}
			= {a * b}
		</p>
	);
}
