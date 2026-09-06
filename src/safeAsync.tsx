import type { Child, FC } from "hono/jsx";

export interface SafeAsyncFallbackProps {
	error: unknown;
}

const DefaultFallback: FC<SafeAsyncFallbackProps> = () => (
	<div
		role="alert"
		data-testid="yamf-error"
		style="padding: 1rem; border: 1px solid currentColor"
	>
		Something went wrong.
	</div>
);

/**
 * Wraps an async server component with error handling for streaming SSR.
 *
 * When an async component inside a Suspense boundary rejects after the shell
 * has been flushed, the streaming renderer swallows the error: the browser
 * keeps the loading fallback forever with a 200 status, and nothing reaches
 * the error handler. `safeAsync` awaits the component directly, so a
 * rejection is caught here and rendered as `fallback` instead.
 *
 * Catches errors of the wrapped component itself, not of its subtree.
 */
export const safeAsync = <P extends object>(
	Component: (props: P) => Child | Promise<Child>,
	fallback: FC<SafeAsyncFallbackProps> = DefaultFallback,
): FC<P> => {
	const Safe = async (props: P): Promise<Child> => {
		try {
			return await Component(props);
		} catch (error) {
			console.error("[yamf] safeAsync: async component rejected", error);

			return fallback({ error });
		}
	};

	// hono's FC type does not include Promise<Child> in its return type,
	// but the JSX renderer awaits component results
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	return Safe as FC<P>;
};
