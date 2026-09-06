import { definePage } from "@pajecawav/yamf";

export default definePage({
	cache: {
		maxAge: 60,
		swr: 10,
		private: true,
	},
	render: () => {
		return <p data-testid="cached-private">cached private</p>;
	},
});
