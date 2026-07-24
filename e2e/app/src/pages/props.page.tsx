import { definePage } from "@pajecawav/yamf";
import { PropsDemo } from "../components/PropsDemo.island";

export default definePage({
	render: () => {
		return (
			<PropsDemo
				date={new Date("2024-01-15T12:30:00.000Z")}
				map={
					new Map([
						["a", 1],
						["b", 2],
					])
				}
				set={new Set(["x", "y", "z"])}
				url={new URL("https://example.com/test")}
				regex={new RegExp("hello", "g")}
				bigint={BigInt(999)}
			/>
		);
	},
});
