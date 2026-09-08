import React from "react";
import * as THREE from "three";

export type ViewMode = "single_view" | "quad_view";
export type OrientationMode = "3d" | "axial" | "sagittal" | "coronal";
export type PlaneOrientation = "axial" | "sagittal" | "coronal";

export interface LayerTransform {
  translate?: [number, number, number];
  rotate?: [number, number, number]; // degrees (x, y, z)
  scale?: [number, number, number];
}

export interface LayerState {
  id: string;
  material: THREE.ShaderMaterial;
  uniforms: Record<string, { value: any }>;
  renderOrder: number;
  setOpacity: (v: number) => void;
  setWindowLevel?: (center: number, width: number) => void;
  setLut?: (name: string) => void;
  setTransform: (t: LayerTransform) => void;
  lut?: any; // LutHelper — present for continuous overlays
  segLut?: any; // SegmentationLutHelper — present for segmentation overlays
  baseLps2IJK: THREE.Matrix4; // original lps2IJK clone for transform composition
}

export interface DicomViewerState {
  stack: any | null; // @metacell/ami StackModel
  viewMode: ViewMode;
  orientation: OrientationMode;
  sliceIndices: Record<PlaneOrientation, number>;
  sliceMaxIndices: Record<PlaneOrientation, number>;
  planeStackOrientations: Record<PlaneOrientation, number>;
  isLoading: boolean;
  layers: LayerState[];
  threshold3D: number;
  threshold3DEnabled: boolean;
}

export interface DicomViewerActions {
  setStack: (stack: any) => void;
  setViewMode: (mode: ViewMode) => void;
  setOrientation: (orientation: OrientationMode) => void;
  setThreshold3D: (value: number) => void;
  setThreshold3DEnabled: (enabled: boolean) => void;
  setSliceIndex: (plane: PlaneOrientation, idx: number) => void;
  setSliceMaxIndex: (plane: PlaneOrientation, maxIdx: number) => void;
  // Bulk setter kept for API compatibility; prefer setSliceMaxIndex for new code.
  setSliceMaxIndices: (maxIndices: Record<PlaneOrientation, number>) => void;
  setPlaneStackOrientation: (plane: PlaneOrientation, stackOrientation: number) => void;
  setLoading: (loading: boolean) => void;
  centerOnPoint: (point: THREE.Vector3) => void;
  registerLayer: (layer: LayerState) => void;
  unregisterLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerTransform: (id: string, transform: LayerTransform) => void;
  setLayerWindowLevel: (id: string, center: number, width: number) => void;
  setLayerLut: (id: string, name: string) => void;
}

/*
 * sliceIndices is deliberately NOT part of the context: it is the highest-frequency write in the
 * viewer, and including it made every scrub tick produce a new context value and re-render every
 * consumer. Components that need it subscribe directly with useSliceIndices(useDicomCanvasId()),
 * so only they re-render.
 */
// Full context exposed to hooks/buttons inside <DicomViewer>
export interface DicomViewerContext
  extends Omit<DicomViewerState, "sliceIndices">, DicomViewerActions {
  rawData: string | string[] | null;
  dataToWorld: (ijk: THREE.Vector3) => THREE.Vector3;
  worldToData: (lps: THREE.Vector3) => THREE.Vector3;
  syncLocalizers: () => void;
  viewportScenes: Partial<Record<OrientationMode, THREE.Scene>>;
  registerViewportScene: (id: OrientationMode, scene: THREE.Scene) => void;
}

export interface ViewportHandle {
  id: number;
  scene: THREE.Scene;
  camera: THREE.Camera;
}

export interface ToolbarOptions {
  instance?: React.ElementType;
  props?: Record<string, any>;
  containerStyles?: React.CSSProperties;
  toolBarClassName?: string;
  innerDivStyles?: React.CSSProperties;
  buttonStyles?: React.CSSProperties;
}

export interface ToolbarButton {
  icon: any;
  tooltip: string;
  action: () => void;
  id?: string;
}

export interface ToolbarButtons {
  minimized?: ToolbarButton[];
  fullScreen?: ToolbarButton[];
  single_view?: ToolbarButton[];
  quad_view?: ToolbarButton[];
}

export interface LoaderOptions {
  show?: boolean;
  component?: React.ElementType;
}

export type ClickAction =
  | "goToPoint"
  | "expandView" // expand / collapse the clicked viewport (ctrl+click default)
  | ((
      ctx: DicomViewerContext,
      point: THREE.Vector3,
      event: MouseEvent,
      planeOrientation: PlaneOrientation | "3d",
    ) => void);

export type HoverAction = (
  ctx: DicomViewerContext,
  point: THREE.Vector3 | null,
  planeOrientation: PlaneOrientation | "3d",
) => void;

/*
 * The full set of per-viewport mouse interactions, bundled so it can be threaded through
 * DicomViewer -> DicomCanvas -> Viewport2D/3DContent -> useViewportEvents as one prop instead of six.
 */
export interface ViewportInteractions {
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
}

// Stable empty default so consumers that pass no interactions don't trigger effect churn.
export const NO_INTERACTIONS: ViewportInteractions = {};

export interface DicomViewerProps {
  id: string;
  data: string | string[];
  // Noun used in the loading overlay's copy, e.g. "Loading scan… 42%" (default: "image")
  assetLabel?: string;
  mode?: ViewMode;
  orientation?: OrientationMode;
  threshold3D?: number; // initial intensity threshold for 3D transparency (0 = off)
  fullScreen?: boolean;
  onLoaded?: () => void;
  interactions?: ViewportInteractions;
  showDownloadButton?: boolean;
  applySegmentationLUT?: boolean;
  animationSkipRate?: number;
  toolbarOptions?: ToolbarOptions;
  loaderOptions?: LoaderOptions;
  toolbarButtons?: ToolbarButtons;
  onRender?: (viewports: ViewportHandle[]) => void;
  onFps?: (fps: number) => void;
  // R3F scene content (DicomLayer, DicomOverlay) — rendered inside the WebGL Canvas.
  children?: React.ReactNode;
  // DOM / HTML content (toolbar, HUD) — rendered outside the Canvas.
  overlay?: React.ReactNode;
}
