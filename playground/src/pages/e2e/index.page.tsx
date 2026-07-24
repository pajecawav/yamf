import { definePage } from "@pajecawav/yamf";
import { Container } from "./components/Container";
import DefaultCounter, { Counter } from "./components/Counter.island";

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
					<Counter initialValue={3} />
					<DefaultCounter initialValue={7} withTitle />
				</Container>
				<p data-testid="url">URL: {event.url.toString()}</p>
			</>
		);
	},
});
