import { defineServerEntry } from "@pajecawav/yamf/server";
import { Layout } from "./components/Layout";

export default defineServerEntry({
	Layout,
});

if (import.meta.hot) {
	import.meta.hot.accept();
}
