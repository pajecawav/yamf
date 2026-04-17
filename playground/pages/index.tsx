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
					{/*<NoHydration>*/}
					<Counter initialValue={1} />
					<Island Component={Counter} props={{ initialValue: 2 }} />
					<Suspense fallback={<span>Loading...</span>}>
						<AsyncCounter initialValue={3} />
					</Suspense>

					<p>URL: {event.url.toString()}</p>

					{/*<HydrationScript />*/}
					{/*</NoHydration>*/}
				</body>
			</html>
		);
	},
});
