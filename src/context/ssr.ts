import type { ImportAssetsResult } from "#/shared/assets";
import type { Context } from "hono/jsx";
import { createContext } from "hono/jsx";

interface SSRContextValue {
	serverAssets?: ImportAssetsResult;
}

export const SSRContext: Context<SSRContextValue | null> = createContext<SSRContextValue | null>(
	null,
);
