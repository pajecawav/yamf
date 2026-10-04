import { definePage } from "@pajecawav/yamf";

export default definePage({
	render: event => {
		const myId = event.context.params?.my_id;

		return (
			<div>
				<p data-testid="param-my-id">{myId}</p>
			</div>
		);
	},
});
