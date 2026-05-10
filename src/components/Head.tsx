import type { ResolvableHead } from "unhead/types";
import { useHead } from "#/hooks/useHead";

export type HeadProps = ResolvableHead;

export const Head = (props: HeadProps): void => {
	useHead(props);
};
