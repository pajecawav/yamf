import { Suspense } from "hono/jsx";
import { definePage } from "yamf";
import { AsyncCounter } from "~/components/AsyncCounter";
import { Container } from "~/components/Container";
import Counter from "~/components/Counter.island";

export default definePage({
	loader: () => null,
	render: (event, { head }) => {
		head.push({ title: "YAMF Playground" });

		return (
			<>
				<Container>
					<Counter initialValue={1} />

					<Counter initialValue={2} />

					<Suspense fallback={<span>Loading...</span>}>
						<AsyncCounter initialValue={3} />
					</Suspense>

					<Suspense fallback={<span>Loading...</span>}>
						<AsyncCounter initialValue={7} delay={5000} />
					</Suspense>
				</Container>

				<p>URL: {event.url.toString()}</p>
			</>
		);
	},
});
