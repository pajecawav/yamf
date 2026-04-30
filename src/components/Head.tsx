import { useHead } from "#/hooks/useHead";
import type { ResolvableHead } from "unhead/types";

export type HeadProps = ResolvableHead;

export const Head = (props: HeadProps): void => {
	useHead(props);
};
