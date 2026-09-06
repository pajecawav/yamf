import { definePage } from "@pajecawav/yamf";
import { Counter } from "~/components/Counter.island";

export default definePage({
	render: () => {
		return <Counter yamf-client={false} initialValue={9} />;
	},
});
