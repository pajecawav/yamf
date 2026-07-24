import { definePage } from "@pajecawav/yamf";

export default definePage({
	render: event => {
		const id = event.context.params?.id;

		return (
			<div>
				<p data-testid="param-id">{id}</p>
			</div>
		);
	},
});
