import { definePage, safeAsync } from "@pajecawav/yamf";
import { Suspense } from "hono/jsx";

const Bomb = async () => {
	await new Promise(resolve => setTimeout(resolve, 100));
	throw new Error("boom-mid-stream");
};

const SafeBomb = safeAsync(Bomb, () => <p data-testid="error-fallback">failed</p>);

export default definePage({
	stream: true,
	render: () => {
		return (
			<Suspense fallback={<span data-testid="loading">Loading...</span>}>
				<SafeBomb />
			</Suspense>
		);
	},
});
