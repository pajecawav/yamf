import { definePage } from "@pajecawav/yamf";
import { Suspense } from "hono/jsx";
import { AsyncCounter } from "~/components/AsyncCounter";

// dedicated streaming page for the prerender suite: /streaming itself stays
// dynamic because its live fallback→resolve behavior is covered by specs
export default definePage({
	stream: true,
	render: () => {
		return (
			<>
				<Suspense fallback={<span data-testid="prerender-loading-1">Loading 1...</span>}>
					<AsyncCounter initialValue={10} delay={200} />
				</Suspense>
				<Suspense fallback={<span data-testid="prerender-loading-2">Loading 2...</span>}>
					<AsyncCounter initialValue={20} delay={400} />
				</Suspense>
			</>
		);
	},
});
