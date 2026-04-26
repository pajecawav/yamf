import { definePage } from "yamf";
import { AsyncCounter } from "~/components/AsyncCounter";
import Calc from "~/components/Calc.island";
import { Container } from "~/components/Container";

export default definePage({
	render: event => {
		return (
			<>
				<Container>
					<Calc />
				</Container>

				<AsyncCounter yamf-client="skip" />

				<p>URL: {event.url.toString()}</p>
			</>
		);
	},
});
