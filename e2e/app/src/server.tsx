import { defineServerEntry } from "@pajecawav/yamf/server";

export default defineServerEntry({
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
