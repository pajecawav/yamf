import { defineHandler } from "nitro/h3";
import { createResource, Suspense } from "solid-js";
import { HydrationScript, renderToStream } from "solid-js/web";
import Counter, { type CounterProps } from "../components/Counter.island";

const AsyncCounter = (props: CounterProps) => {
	const [initialValue] = createResource(
		() =>
			new Promise<number | undefined>(resolve =>
				setTimeout(resolve, 2000, props.initialValue),
			),
	);

	return <Counter initialValue={initialValue()} />;
};

export default defineHandler(() => {
	const stream = renderToStream(() => (
		<html>
			<head>
				<title>YAMF Playground</title>
			</head>
			<body>
				<Counter initialValue={1} />
				<Counter initialValue={2} />
				<Suspense fallback={<span>Loading...</span>}>
					<AsyncCounter initialValue={3} />
				</Suspense>

				<HydrationScript />
			</body>
		</html>
	));

	const { readable, writable } = new TransformStream();

	// TODO: prepend doctype html
	stream.pipeTo(writable);

	return new Response(readable, {
		headers: {
			"Content-Type": "text/html",
		},
	});
});
