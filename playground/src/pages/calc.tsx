import { definePage } from "yamf";
import Calc from "~/components/Calc.island";
import { Container } from "~/components/Container";

export default definePage({
	render: event => {
		return (
			<>
				<Container>
					<Calc />
				</Container>

				<p>URL: {event.url.toString()}</p>
			</>
		);
	},
});
