import { definePage } from "@pajecawav/yamf";
import { Suspense } from "hono/jsx";
import { AsyncCounter } from "~/components/AsyncCounter";

export default definePage({
	stream: true,
	render: () => {
		return (
			<Suspense fallback={<span data-testid="loading">Loading...</span>}>
				<AsyncCounter initialValue={30} delay={200} withTitle />
			</Suspense>
		);
	},
});
