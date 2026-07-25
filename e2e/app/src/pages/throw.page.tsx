import { definePage } from "@pajecawav/yamf";

export default definePage({
	render: () => {
		throw new Error("page-boom");
	},
});
