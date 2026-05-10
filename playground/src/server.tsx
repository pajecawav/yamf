import { defineServerEntry } from "@pajecawav/yamf/server";
import { Layout } from "./components/Layout";

export default defineServerEntry({
	Layout,
	head: () => {
		return {
			titleTemplate: "%s | playground",
			seo: {
				title: "testtest",
				description: "hello world",
			},
		};
	},
});

if (import.meta.hot) {
	import.meta.hot.accept();
}
