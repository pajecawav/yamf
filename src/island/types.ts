export type IslandClientDirective = "load" | "idle" | "visible" | "skip";

export interface IslandProps {
	"yamf-client"?: IslandClientDirective;
}
