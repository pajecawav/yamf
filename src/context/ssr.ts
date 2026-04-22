import { type Context, createContext } from "hono/jsx";
import type { ServerUnhead } from "unhead/server";

interface SSRContextValue {
	head: ServerUnhead;
}

export const SSRContext: Context<SSRContextValue | null> = createContext<SSRContextValue | null>(
	null,
);
