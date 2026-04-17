import { Suspense } from "solid-js";
import { definePage, Head, Island } from "yamf";
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
						style={{
							display: "flex",
							"align-items": "flex-start",
							gap: "16px",
						}}
					>
						<Counter initialValue={1} />

						<Island Component={Counter} props={{ initialValue: 2 }} />

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
