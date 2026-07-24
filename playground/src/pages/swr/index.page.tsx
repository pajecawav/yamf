import { definePage } from "@pajecawav/yamf";
import { SwrDemo } from "./SwrDemo.island";

export default definePage({
	render: async () => {
		return (
			<SwrDemo
			// fallbackData="fallback"
			/>
		);
	},
});
