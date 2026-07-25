import { defineErrorHandler } from "nitro";

export default defineErrorHandler(error => {
	console.error(error);

	return new Response(
		`custom error: ${error.status} ${error.statusText ?? "Something went wrong"}`,
		{
			status: error.status,
		},
	);
});
