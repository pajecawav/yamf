import { definePage } from "@pajecawav/yamf";
import { HTTPResponse } from "nitro/h3";

export default definePage({
	render: async () => {
		return new HTTPResponse(null, {
			status: 302,
			headers: { location: "/" },
		});
	},
});
