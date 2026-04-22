import { defineServerEntry } from "yamf/server";

export default defineServerEntry();

if (import.meta.hot) {
	import.meta.hot.accept();
}
