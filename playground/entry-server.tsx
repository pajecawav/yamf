// import { defineHandler } from "nitro/h3";
// import clientAssets from "./client/index.ts?assets=client";
// import serverAssets from "./entry-server?assets=ssr";

// console.log("entry-server", { clientAssets, serverAssets });

// // export default {
// // 	fetch(): Response {
// // 		return new Response("123");
// // 	},
// // };

// export default defineHandler(event => {
// 	return 123;
// });

import { defineHandler } from "nitro/h3";
import {
	// HydrationScript,
	renderToStream,
} from "solid-js/web";
import { Island, Head } from "yamf";
import { createResource, Suspense } from "solid-js";
import Counter, { type CounterProps } from "./components/Counter.island";

const AsyncCounter = (props: CounterProps) => {
	const [initialValue] = createResource(
		() =>
			new Promise<number | undefined>(resolve =>
				setTimeout(resolve, 2000, props.initialValue),
			),
	);

	return <Island Component={Counter} props={{ initialValue: initialValue() }} />;
};

export default defineHandler(() => {
	const stream = renderToStream(() => (
		<html>
			<Head>
				<title>YAMF Playground</title>
			</Head>
			<body>
				<Counter initialValue={1} />
				<Island Component={Counter} props={{ initialValue: 2 }} />
				<Suspense fallback={<span>Loading...</span>}>
					<AsyncCounter initialValue={3} />
				</Suspense>

				{/*<HydrationScript />*/}
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
