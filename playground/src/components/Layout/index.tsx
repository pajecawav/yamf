import type { PropsWithChildren } from "hono/jsx";
import styles from "./Layout.module.css";

export const Layout = ({ children }: PropsWithChildren) => {
	return <div class={styles.layout}>{children}</div>;
};
