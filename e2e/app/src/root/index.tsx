import type { PropsWithChildren } from "hono/jsx";
import styles from "./Root.module.css";
import "./index.css";

export default function Root({ children }: PropsWithChildren) {
	return <div class={styles.layout}>{children}</div>;
}
