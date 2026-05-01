import { Suspense } from "hono/jsx";
import { definePage } from "@pajecawav/yamf";
import { AsyncCounter } from "~/components/AsyncCounter";
import { Container } from "~/components/Container";
import { Counter, Doubler, Tripler } from "~/components/Counter.island";

export default definePage({
	stream: true,
	render: (event, { head }) => {
		head.push({
			title: "YAMF Playground",
			bodyAttrs: {
				class: "tteesstt",
			},
		});

		return (
			<>
				<Container>
					<Counter initialValue={1} />

					<Doubler initialValue={2} />

					<Tripler initialValue={3} />

					<Suspense fallback={<span>Loading...</span>}>
						<AsyncCounter initialValue={3} />
					</Suspense>

					<Suspense fallback={<span>Loading...</span>}>
						<AsyncCounter initialValue={7} delay={3500} withTitle />
					</Suspense>
				</Container>

				<p>URL: {event.url.toString()}</p>
			</>
		);
	},
});
