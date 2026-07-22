export type IslandClientDirective = "load" | "idle" | "visible" | "skip" | boolean;
export type IslandClientDirectiveSerialized =
	| "load"
	| "idle"
	| "visible"
	| "skip"
	| "true"
	| "false";

export interface IslandProps {
	"yamf-client"?: IslandClientDirective;
}
