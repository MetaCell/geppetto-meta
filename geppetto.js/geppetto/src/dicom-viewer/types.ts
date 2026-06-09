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

/*
 * Represents a loaded overlay volume's GPU resources + controls.
 * setOpacity encapsulates the background-removal logic so callers
 * don't need to know whether the layer uses a plain uniform or an
 * air-alpha LUT curve.
 */
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
  stack: any | null; // ami.js StackModel
  viewMode: ViewMode;
  orientation: OrientationMode;
  sliceIndices: Record<PlaneOrientation, number>;
  sliceMaxIndices: Record<PlaneOrientation, number>;
  isLoading: boolean;
  layers: LayerState[];
  /*
   * Intensity threshold value for the 3D viewport.
   * Only applied when threshold3DEnabled is true.
   * Fragments with raw intensity below this value are discarded (transparent).
   */
  threshold3D: number;
  /*
   * Whether the threshold is currently active.  Decoupled from the value so a
   * slider can set the value without inadvertently activating transparency, and
   * the toolbar button can toggle on/off without resetting the slider position.
   */
  threshold3DEnabled: boolean;
}

export interface DicomViewerActions {
  setStack: (stack: any) => void;
  setViewMode: (mode: ViewMode) => void;
  setOrientation: (orientation: OrientationMode) => void;
  setThreshold3D: (value: number) => void;
  setThreshold3DEnabled: (enabled: boolean) => void;
  setSliceIndex: (plane: PlaneOrientation, idx: number) => void;
  /*
   * Per-plane setter (preferred) — uses a functional Zustand update so concurrent
   * calls from multiple viewports cannot overwrite each other's values.
   */
  setSliceMaxIndex: (plane: PlaneOrientation, maxIdx: number) => void;
  // Bulk setter kept for API compatibility; prefer setSliceMaxIndex for new code.
  setSliceMaxIndices: (maxIndices: Record<PlaneOrientation, number>) => void;
  setLoading: (loading: boolean) => void;
  registerLayer: (layer: LayerState) => void;
  unregisterLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerTransform: (id: string, transform: LayerTransform) => void;
  setLayerWindowLevel: (id: string, center: number, width: number) => void;
}

// Full context exposed to hooks/buttons inside <DicomViewer>
export interface DicomViewerContext extends DicomViewerState, DicomViewerActions {
  rawData: string | string[] | null;
  dataToWorld: (ijk: THREE.Vector3) => THREE.Vector3;
  worldToData: (lps: THREE.Vector3) => THREE.Vector3;
  syncLocalizers: () => void;
  /*
   * Per-viewport scene objects — populated by Viewport*Content components once ready.
   * DicomOverlay uses these to portal overlay children into individual scenes.
   */
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
  | ((ctx: DicomViewerContext, point: THREE.Vector3, event: MouseEvent) => void);

export interface DicomViewerProps {
  id: string;
  data: string | string[];
  mode?: ViewMode;
  orientation?: OrientationMode;
  threshold3D?: number; // initial intensity threshold for 3D transparency (0 = off)
  fullScreen?: boolean;
  onLoaded?: () => void;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
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
  /*
   * DOM / HTML content (toolbar, HUD) — rendered outside the Canvas in a normal
   * React DOM tree so that HTML elements are not mistaken for Three.js objects.
   */
  overlay?: React.ReactNode;
}
