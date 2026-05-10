import { type Context, createContext, useContext } from "hono/jsx";
import type { H3Event } from "nitro";
import type { ServerUnhead } from "unhead/server";

interface SSRContextValue {
	head: ServerUnhead;
	event: H3Event;
}

export const SSRContext: Context<SSRContextValue | null> = createContext<SSRContextValue | null>(
	null,
);

export const useSSRContext = (): SSRContextValue | null => {
	return useContext(SSRContext);
};
