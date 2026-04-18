import { Suspense } from "hono/jsx";
import { definePage, Head } from "yamf";
import { AsyncCounter } from "~/components/AsyncCounter";
import Counter from "~/components/Counter.island";

export default definePage({
	loader: () => null,
	render: event => {
		return (
			<html>
				<Head>
					<title>YAMF Playground</title>
				</Head>
				<body>
					<div
						// TODO: page assets
						style={{
							display: "flex",
							"align-items": "flex-start",
							gap: "16px",
						}}
					>
						<Counter initialValue={1} />

						<Counter initialValue={2} />

						<Suspense fallback={<span>Loading...</span>}>
							<AsyncCounter initialValue={3} />
						</Suspense>

						<Suspense fallback={<span>Loading...</span>}>
							<AsyncCounter initialValue={7} delay={5000} />
						</Suspense>
					</div>

					<p>URL: {event.url.toString()}</p>
				</body>
			</html>
		);
	},
});
