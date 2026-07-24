import { definePage } from "@pajecawav/yamf";
import { Suspense } from "hono/jsx";
import { AsyncCounter } from "~/components/AsyncCounter";
import { Container } from "~/components/Container";

export default definePage({
	stream: true,
	render: () => {
		return (
			<Container>
				<Suspense fallback={<span data-testid="loading-1">Loading 1...</span>}>
					<AsyncCounter initialValue={10} delay={200} />
				</Suspense>

				<Suspense fallback={<span data-testid="loading-2">Loading 2...</span>}>
					<AsyncCounter initialValue={20} delay={400} />
				</Suspense>
			</Container>
		);
	},
});
