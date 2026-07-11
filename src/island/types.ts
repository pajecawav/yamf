export type IslandClientDirective = "load" | "idle" | "visible" | "skip" | boolean;

export interface IslandProps {
	"yamf-client"?: IslandClientDirective;
}
