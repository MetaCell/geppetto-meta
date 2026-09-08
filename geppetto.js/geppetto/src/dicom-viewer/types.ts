import React from "react";
import * as THREE from "three";

// `(string & {})` keeps autocomplete for the two built-ins while still allowing any custom mode name.
export type ViewMode = "single_view" | "quad_view" | (string & {});
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
  /*
   * Keyed by "slice key" (not PlaneOrientation) — a pane's own id by default, or another pane's id
   * when it opts into PaneDescriptor.syncSliceWith. The canonical panes' ids equal their
   * orientation, so this is the same "canonical id doubles as the key" convention as
   * viewportScenes; a custom pane gets its own independent slot unless it syncs to one.
   */
  sliceIndices: Record<string, number>;
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
  setSliceIndex: (sliceKey: string, idx: number) => void;
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
  /*
   * Keyed by pane id (not OrientationMode) — the canonical panes' ids happen to equal their
   * orientation ("3d"/"axial"/"sagittal"/"coronal"), so existing consumers keyed on those strings
   * keep working; a custom pane just adds a non-colliding extra entry under its own id.
   */
  viewportScenes: Partial<Record<string, THREE.Scene>>;
  registerViewportScene: (id: string, scene: THREE.Scene) => void;
}

export interface ViewportHandle {
  id: string;
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

/*
 * One viewport pane: what it shows (kind/planeOrientation), where it sits (style), and which
 * layers/LUT/crosshair color it uses. `id` is the pane's stable identity across mode switches —
 * it drives sticky mounting (see viewports/DicomCanvas.tsx) and is the key used everywhere a pane
 * needs to be addressed (onRender, registerViewportScene, ...). Two panes may share a
 * planeOrientation (e.g. an MRI axial pane and a CT-only axial pane side by side) as long as
 * their ids differ.
 *
 * `kind`/`planeOrientation` are only needed when `id` introduces a genuinely new pane. For the
 * four canonical ids ("3d"/"axial"/"sagittal"/"coronal") they're derived from `id` automatically
 * (see viewports/DicomCanvas.tsx's resolvePaneKind) and any value passed here is ignored — a
 * canonical pane's kind/orientation isn't something a view can override, only reposition, so
 * there's nothing to keep in sync by hand and no way to accidentally mismatch them.
 */
export interface PaneDescriptor {
  id: string;
  kind?: "3d" | "2d";
  planeOrientation?: PlaneOrientation; // required (with kind) when id isn't a canonical pane id
  style: React.CSSProperties | ((activeOrientation: OrientationMode) => React.CSSProperties);
  // Allowlist of registered layer ids this pane draws; omitted = every registered layer.
  layerIds?: string[];
  /*
   * A 2D pane's own current slice defaults to its own id's slot — independent from any other
   * pane, even one sharing its planeOrientation. Set this to another pane's id to instead read and
   * write that pane's slot, keeping the two in lockstep (scrubbing either one moves both).
   */
  syncSliceWith?: string;
  sliceColor?: number; // crosshair tint; falls back to a per-orientation default when omitted
  /*
   * Fires once, when this pane paints its first real frame. `siblings` is every other pane of the
   * same view that has already fired, keyed by id (inclusive of this pane) — enough to implement
   * "wire A and B together once both exist" without the framework doing that wiring itself.
   */
  onRender?: (handle: ViewportHandle, siblings: Readonly<Record<string, ViewportHandle>>) => void;
}

/*
 * Named view modes, keyed by the string passed as DicomViewer's `mode` prop. Each entry is just an
 * array of panes — DEFAULT_VIEW_LAYOUTS (exported from viewports/DicomCanvas) supplies
 * "single_view" and "quad_view" this way too, so a custom mode is described identically to a
 * built-in one. A consumer adds a mode by spreading that default map and adding its own entry —
 * no registry, no subclassing.
 */
export type ViewLayouts = Record<string, PaneDescriptor[]>;

export interface DicomViewerProps {
  id: string;
  data: string | string[];
  // Noun used in the loading overlay's copy, e.g. "Loading scan… 42%" (default: "image")
  assetLabel?: string;
  mode?: ViewMode;
  // Custom/extra view modes, merged over DEFAULT_VIEW_LAYOUTS (see viewports/DicomCanvas.tsx)
  viewLayouts?: ViewLayouts;
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
  // Fires once, when every pane declared by viewLayouts[mode] has painted its first frame.
  onRender?: (viewports: Readonly<Record<string, ViewportHandle>>, mode: string) => void;
  onFps?: (fps: number) => void;
  // R3F scene content (DicomLayer, DicomOverlay) — rendered inside the WebGL Canvas.
  children?: React.ReactNode;
  // DOM / HTML content (toolbar, HUD) — rendered outside the Canvas.
  overlay?: React.ReactNode;
}
