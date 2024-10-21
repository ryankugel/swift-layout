export type StateStorage = "session" | "local";

export type PaneRegion = "center" | "top" | "bottom" | "left" | "right";

export type LayoutOrientation = "horizontal" | "vertical";

export class Constants {
  static readonly storageSession = "session";
  static readonly storageLocal = "local";
  static readonly horizontalOrientation = "horizontal";
  static readonly verticalOrientation = "vertical";
  static readonly paneTypeFirst = "first";
  static readonly sectionSelector = ".layout-pane-section";
  static readonly layoutComponentClass = "layout-component";
  static readonly paneResizingClass = "pane-resizing";
  static readonly gutterClass = "layout-pane-gutter";
  static readonly gutterResizingClass = "pane-gutter-resizing";
  static readonly gutterFirstClass = "gutter-first";
  static readonly invalidResizeClass = "invalid-resize";
  static readonly mouseMoveEvent = "mousemove";
  static readonly mouseUpEvent = "mouseup";
  static readonly centerRegion = "center";
  static readonly topRegion = "top";
  static readonly bottomRegion = "bottom";
  static readonly leftRegion = "left";
  static readonly rightRegion = "right";
}
