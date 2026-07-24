import { definePage } from "@pajecawav/yamf";
import { HTTPResponse } from "nitro/h3";

export default definePage({
	render: async () => {
		// return redirect("/e2e/calc");

		return new HTTPResponse(null, {
			status: 302,
			headers: { location: "/e2e/calc" },
		});
	},
});
