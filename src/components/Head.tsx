import { useHead } from "#/hooks/useHead";
import type { YamfHead } from "#/shared/head";

export type HeadProps = YamfHead;

export const Head = (props: HeadProps): void => {
	useHead(props);
};
