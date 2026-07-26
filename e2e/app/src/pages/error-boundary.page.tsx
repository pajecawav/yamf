import { definePage } from "@pajecawav/yamf";
import { ErrorBoundary } from "hono/jsx";

const Bomb = ({ message }: { message: string }) => {
	throw new Error(message);
};

export default definePage({
	render: () => {
		let onErrorValue = "not-called";

		return (
			<div>
				<div data-testid="outside">outside content</div>

				<ErrorBoundary fallback={<div data-testid="fallback-static">static fallback</div>}>
					<Bomb message="boom-sync" />
				</ErrorBoundary>

				<ErrorBoundary
					fallbackRender={error => (
						<div data-testid="fallback-render">{error.message}</div>
					)}
				>
					<Bomb message="boom-render" />
				</ErrorBoundary>

				<ErrorBoundary
					fallbackRender={() => (
						<div data-testid="onerror-fallback">onerror {onErrorValue}</div>
					)}
					onError={error => {
						onErrorValue = error.message;
					}}
				>
					<Bomb message="boom-onerror" />
				</ErrorBoundary>

				<ErrorBoundary
					fallback={<div data-testid="should-not-show">no error fallback</div>}
				>
					<div data-testid="ok-child">ok child</div>
				</ErrorBoundary>
			</div>
		);
	},
});
