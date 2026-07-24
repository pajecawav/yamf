import { definePage } from "@pajecawav/yamf";

export default definePage({
	render: async () => {
		return <p data-testid="nested">nested</p>;
	},
});
