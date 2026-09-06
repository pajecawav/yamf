import { definePage, useHead } from "@pajecawav/yamf";

const WithSeo = () => {
	useHead({
		title: "SEO mid",
		seo: {
			description: "mid-render seo",
		},
	});

	return <p data-testid="seo-mid">seo</p>;
};

export default definePage({
	render: () => {
		return <WithSeo />;
	},
});
