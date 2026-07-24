import { QueryClient, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

interface QueryDemoProps {
	initialData?: unknown;
}

export const QueryDemo = ({ initialData }: QueryDemoProps) => {
	const query = useQuery(
		{
			queryKey: ["user"],
			queryFn: async () => {
				const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
				return res.json();
			},
			initialData,
			// staleTime: Infinity,
		},
		queryClient,
	);

	return <pre>{query.data ? JSON.stringify(query.data, null, 2) : "loading..."}</pre>;
};
