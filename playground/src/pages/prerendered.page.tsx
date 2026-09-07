import { definePage, isPrerendering } from "@pajecawav/yamf";
import { Container } from "~/components/Container";
import { Counter } from "~/components/Counter.island";

// components inside the render tree can ask whether this render pass belongs
// to nitro's build-time prerenderer. (Calling hooks directly in the render
// function body won't do: it runs before the SSR context is mounted — there,
// read the `event` passed to render instead.)
const RenderPass = () => {
	if (isPrerendering()) {
		return (
			<p data-testid="render-pass">
				prerendered at {new Date().toISOString()} — frozen into the static file, reload all
				you want
			</p>
		);
	}

	return (
		<p data-testid="render-pass">
			server-rendered at {new Date().toISOString()} — fresh on every request (dev mode, or a
			route not listed in the prerender config)
		</p>
	);
};

export default definePage({
	render: (_event, { head }) => {
		head.push({ title: "Prerendered" });

		return (
			<Container>
				<h1>Prerendered</h1>
				<p>
					This route is listed in <code>nitro.prerender.routes</code> (see{" "}
					<code>vite.config.ts</code>), so <code>vite build</code> fetches it once through
					the production SSR path and writes the response to{" "}
					<code>.output/public/prerendered/index.html</code>. The server then serves that
					static file instead of rendering.
				</p>
				<RenderPass />
				<p>the island below hydrates on the static file just like on an SSR response:</p>
				<Counter initialValue={42} />
				<p>
					<a href="/">← playground index</a>
				</p>
			</Container>
		);
	},
});
