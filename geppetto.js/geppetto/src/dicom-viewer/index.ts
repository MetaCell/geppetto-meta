// Main viewer component
export { DicomViewer, default as DicomViewerDefault } from "./DicomViewer";
// Preconfigured viewer with built-in toolbar — convenient drop-in
export { DicomViewer as DicomViewerPreconf } from "./preconf/DicomViewer";

// Overlay / layer composition
export { DicomOverlay } from "./layers/DicomOverlay";
export { DicomLayer } from "./layers/DicomLayer";

// Toolbar components (optional — include only when building a custom toolbar)
export { DicomViewerToolbar } from "./toolbar/DicomViewerToolbar";
export { DicomViewerButton } from "./toolbar/DicomViewerButton";

// Context hook — use inside any component rendered inside <DicomViewer>
export { useDicomViewerContext } from "./DicomViewerContext";

/*
 * Canvas-id context + per-canvas R3F root-state registry, aliased to avoid a name collision
 * with 3d-canvas's own exports of the same shape.
 */
export {
  CanvasIdContext as DicomCanvasIdContext,
  useCanvasId as useDicomCanvasId,
  useFiber as useDicomFiber,
} from "./canvas-context";

// Low-level hooks (for advanced use cases)
export { useDicomViewer, useDicomViewerStore } from "./hooks/useDicomViewerStore";
export { useVolumeLoader, pctOf } from "./hooks/useVolumeLoader";
export { useLayerStack } from "./hooks/useLayerStack";
export { createLayerMaterial, LUT_PRESETS } from "./layers/createLayerMaterial";

// Geometry helpers (for building custom slice-aware overlays)
export { soToCol, makePlaneFilter, VP_ID_MAP } from "./utils";
export type { PlaneFilter } from "./utils";
export { usePlaneFilters } from "./hooks/usePlaneFilters";

// Types
export type {
  ViewMode,
  OrientationMode,
  PlaneOrientation,
  LayerTransform,
  LayerState,
  DicomViewerState,
  DicomViewerActions,
  DicomViewerContext as DicomViewerContextType,
  DicomViewerProps,
  ViewportHandle,
  ToolbarOptions,
  ToolbarButton,
  ToolbarButtons,
  ClickAction,
  HoverAction,
} from "./types";
export type { CanvasRootState } from "./canvas-context";
export type { DownloadProgress, UseVolumeLoaderOptions } from "./hooks/useVolumeLoader";
