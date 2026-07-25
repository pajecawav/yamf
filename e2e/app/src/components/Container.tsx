import type { PropsWithChildren } from "hono/jsx";
import styles from "./Container.module.css";

export const Container = (props: PropsWithChildren) => {
	return <div class={styles.container}>{props.children}</div>;
};
