export type VoidListener = VoidFunction | null | undefined;

export type StateStorage = "session" | "local";

export type PaneRegion = "center" | "top" | "bottom" | "left" | "right";

export type LayoutOrientation = "horizontal" | "vertical";

export interface SavedState {
  firstPaneSize?: number;
  lastPaneSize?: number;
  firstPaneVisible?: boolean;
  lastPaneVisible?: boolean;
}
