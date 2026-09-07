import { definePage, useHead } from "@pajecawav/yamf";

const NotFound = () => {
	useHead({ title: "Not found" });

	return <p data-testid="not-found">nothing here</p>;
};

// prerendered as 404.html (yamf renames the /404 output) for static hosts
export default definePage({
	render: () => <NotFound />,
});
