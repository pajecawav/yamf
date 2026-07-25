import { defineErrorHandler } from "nitro";

export default defineErrorHandler(error => {
	return new Response(`yamf ${error.status} ${error.statusText ?? "Something went wrong"}`, {
		status: error.status,
	});
});
