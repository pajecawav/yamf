import { definePage } from "@pajecawav/yamf";

export default definePage({
	cache: 120,
	render: () => {
		return <p data-testid="cached">cached</p>;
	},
});
