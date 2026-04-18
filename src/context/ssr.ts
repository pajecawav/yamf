import type { ImportAssetsResult } from "#/shared/types";
import { createContext } from "hono/jsx";

interface SSRContextValue {
	serverAssets?: ImportAssetsResult;
}

export const SSRContext = createContext<SSRContextValue | null>(null);
