import { definePage, Head } from "yamf";
import Calc from "~/components/Calc.island";
import { Container } from "~/components/Container";

export default definePage({
	loader: () => null,
	render: event => {
		return (
			<html>
				<Head>
					<title>YAMF Playground</title>
				</Head>
				<body>
					<Container>
						<Calc />
					</Container>

					<p>URL: {event.url.toString()}</p>
				</body>
			</html>
		);
	},
});
