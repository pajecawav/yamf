import useSWRImmutable from "swr/immutable";

interface SwrDemo {
	fallbackData?: unknown;
}

export const SwrDemo = ({ fallbackData }: SwrDemo) => {
	const query = useSWRImmutable(
		"user",
		async () => {
			const res = await fetch("https://jsonplaceholder.typicode.com/users/10");
			return res.json();
		},
		{ fallbackData },
	);

	return <pre>{query.data ? JSON.stringify(query.data, null, 2) : "loading..."}</pre>;
};
