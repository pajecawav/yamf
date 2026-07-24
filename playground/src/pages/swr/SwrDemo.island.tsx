import { useReducer } from "hono/jsx";
import useSWR from "swr";

interface SwrDemo {
	fallbackData?: unknown;
}

export const SwrDemo = ({ fallbackData }: SwrDemo) => {
	const [id, increment] = useReducer((state: number) => state + 1, 1);

	const query = useSWR(
		["user", id],
		async () => {
			const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
			return res.json();
		},
		{ fallbackData, revalidateOnFocus: false, keepPreviousData: true },
	);

	return (
		<div>
			<button onClick={increment}>id: {id}</button>
			<pre>{query.data ? JSON.stringify(query.data, null, 2) : "loading..."}</pre>
		</div>
	);
};
