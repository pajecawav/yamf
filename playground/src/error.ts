import { defineErrorHandler } from "nitro";
import type { NitroErrorHandler } from "nitro/types";

const handler: NitroErrorHandler = defineErrorHandler(error => {
	console.error(error);

	return new Response(`${error.status} ${error.statusText ?? "Something went wrong"}`, {
		status: error.status,
	});
});

export default handler;
