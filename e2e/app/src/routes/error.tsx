import { defineHandler } from "nitro";

export default defineHandler(() => {
	throw new Error("test");
});
