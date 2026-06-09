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

// Low-level hooks (for advanced use cases)
export { useDicomViewer, useDicomViewerStore } from "./hooks/useDicomViewerStore";
export { useVolumeLoader } from "./hooks/useVolumeLoader";
export { useLayerStack } from "./hooks/useLayerStack";
export { createLayerMaterial } from "./layers/createLayerMaterial";

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
} from "./types";
