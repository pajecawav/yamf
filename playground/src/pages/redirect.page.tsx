import { definePage } from "@pajecawav/yamf";
import { HTTPResponse, redirect } from "nitro/h3";

export default definePage({
	render: async () => {
		// return redirect("/calc");

		return new HTTPResponse(null, {
			status: 302,
			headers: { location: "/calc" },
		});
	},
});
