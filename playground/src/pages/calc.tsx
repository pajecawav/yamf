import { definePage } from "yamf";
import Calc from "~/components/Calc.island";
import { Container } from "~/components/Container";

export default definePage({
	loader: () => null,
	render: (event, { head }) => {
		head.push({ title: "YAMF Playground" });

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
