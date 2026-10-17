import { definePage } from "@pajecawav/yamf";

export default definePage({
	render: event => {
		const segments = event.context.params?.segments;

		return <p data-testid="catchall-params">{JSON.stringify(segments)}</p>;
	},
});
