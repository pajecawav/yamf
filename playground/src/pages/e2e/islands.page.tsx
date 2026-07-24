import { definePage } from "@pajecawav/yamf";
import { Container } from "./components/Container";
import DefaultCounter, { Counter } from "./components/Counter.island";

export default definePage({
	render: () => {
		return (
			<Container>
				<div data-testid="load">
					<Counter initialValue={1} />
				</div>
				<div data-testid="load-explicit">
					<Counter initialValue={2} yamf-client="load" />
				</div>
				<div data-testid="idle">
					<Counter initialValue={3} yamf-client="idle" />
				</div>
				<div data-testid="visible">
					<Counter initialValue={4} yamf-client="visible" />
				</div>
				<div data-testid="skip">
					<Counter initialValue={5} yamf-client="skip" />
				</div>

				<DefaultCounter initialValue={6} />
			</Container>
		);
	},
});
