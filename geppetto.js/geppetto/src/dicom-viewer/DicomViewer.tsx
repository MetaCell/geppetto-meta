import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DicomViewerContext } from "./DicomViewerContext";
import { CanvasIdContext } from "../3d-canvas/toolbar/Toolbar3D";
import { useDicomViewerStore, useDicomViewer } from "./hooks/useDicomViewerStore";
import { useVolumeLoader } from "./hooks/useVolumeLoader";
import { useLocalizerSync, initLocalizerCrossRefs } from "./hooks/useLocalizerSync";
import { DicomCanvas } from "./viewports/DicomCanvas";
import {
  DicomViewerProps,
  DicomViewerContext as DicomViewerContextType,
  OrientationMode,
  PlaneOrientation,
  ViewportHandle,
} from "./types";

const loadingOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "#fff",
  fontSize: "0.875rem",
  letterSpacing: "0.05em",
  zIndex: 10,
  pointerEvents: "none",
};

export const DicomViewer: React.FC<DicomViewerProps> = ({
  id,
  data,
  mode = "quad_view",
  orientation = "3d",
  threshold3D,
  onLoaded,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
  animationSkipRate = 1,
  onRender,
  onFps,
  children,
  overlay,
}) => {
  // Register this viewer instance in the global store on mount, clean up on unmount
  const { registerViewer, unregisterViewer } = useDicomViewerStore();
  useEffect(() => {
    registerViewer(id);
    return () => unregisterViewer(id);
  }, [id]);

  const viewer = useDicomViewer(id);

  // Load base volume
  const { stack, loading, error } = useVolumeLoader(data);

  // Push the loaded stack into the store; notify caller
  useEffect(() => {
    if (!viewer) return;
    if (stack) {
      viewer.setStack(stack);
      viewer.setLoading(false);
      onLoaded?.();
    } else {
      viewer.setLoading(loading);
    }
  }, [stack, loading]);

  // Sync controlled mode/orientation props into store
  useEffect(() => {
    viewer?.setViewMode(mode);
  }, [mode]);
  useEffect(() => {
    viewer?.setOrientation(orientation);
  }, [orientation]);
  useEffect(() => {
    if (threshold3D !== undefined) viewer?.setThreshold3D(threshold3D);
  }, [threshold3D]);

  /*
   * ---------------------------------------------------------------------------
   * Viewport scene registry — populated by Viewport*Content once they init.
   * DicomOverlay reads these to portal its children into per-viewport scenes.
   * ---------------------------------------------------------------------------
   */
  const vpScenesRef = useRef<Partial<Record<OrientationMode, THREE.Scene>>>({});
  const [viewportScenes, setViewportScenes] = useState<
    Partial<Record<OrientationMode, THREE.Scene>>
  >({});

  const registerViewportScene = useCallback((vpId: OrientationMode, scene: THREE.Scene) => {
    vpScenesRef.current = { ...vpScenesRef.current, [vpId]: scene };
    setViewportScenes(prev => ({ ...prev, [vpId]: scene }));

    /*
     * Wire 2D scenes into the 3D scene so the perspective camera renders slice planes.
     * Pattern from viewers_blend: r0.scene.add(pane.scene). Each 2D scene contains a
     * StackHelper (textured slice quad); adding it to the 3D scene makes those planes
     * visible from the perspective camera without duplicating any geometry or data.
     */
    const all = vpScenesRef.current;
    const scene3d = all["3d"];
    if (scene3d && all.axial && all.sagittal && all.coronal) {
      if (!scene3d.children.includes(all.axial)) scene3d.add(all.axial);
      if (!scene3d.children.includes(all.sagittal)) scene3d.add(all.sagittal);
      if (!scene3d.children.includes(all.coronal)) scene3d.add(all.coronal);
    }
  }, []);

  /*
   * ---------------------------------------------------------------------------
   * Localizer cross-ref initialisation + sync
   * ---------------------------------------------------------------------------
   */
  const vpLocalizersRef = useRef<{
    axial: { stackHelper: any; localizerHelper: any };
    sagittal: { stackHelper: any; localizerHelper: any };
    coronal: { stackHelper: any; localizerHelper: any };
  }>({
    axial: { stackHelper: null, localizerHelper: null },
    sagittal: { stackHelper: null, localizerHelper: null },
    coronal: { stackHelper: null, localizerHelper: null },
  });
  const localizerInitRef = useRef(false);
  const { syncAll } = useLocalizerSync(vpLocalizersRef);

  const handleViewport2DReady = useCallback(
    (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => {
      vpLocalizersRef.current[plane] = { stackHelper, localizerHelper };
      const { axial, sagittal, coronal } = vpLocalizersRef.current;
      if (
        !localizerInitRef.current &&
        axial.stackHelper &&
        sagittal.stackHelper &&
        coronal.stackHelper
      ) {
        initLocalizerCrossRefs(axial, sagittal, coronal);
        localizerInitRef.current = true;
        /*
         * Force an immediate sync so the localizer uniforms reflect the current
         * slice positions — without this the lines wouldn't appear until the next
         * user-driven slice navigation event.
         */
        syncAll();
      }
    },
    [syncAll],
  );

  /*
   * ---------------------------------------------------------------------------
   * onRender callback — fires once all 4 viewport handles are ready
   * ---------------------------------------------------------------------------
   */
  const vpHandlesRef = useRef<(ViewportHandle | undefined)[]>([]);
  const handleViewportReady = useCallback(
    (vpId: number, scene: any, camera: any) => {
      vpHandlesRef.current[vpId] = { id: vpId, scene, camera };
      const readyCount = vpHandlesRef.current.filter(Boolean).length;
      if (readyCount === 4) {
        onRender?.(vpHandlesRef.current as ViewportHandle[]);
      }
    },
    [onRender],
  );

  /*
   * ---------------------------------------------------------------------------
   * Coordinate conversion helpers
   * ---------------------------------------------------------------------------
   */
  const dataToWorld = useCallback(
    (ijk: THREE.Vector3): THREE.Vector3 => {
      if (!stack) return ijk.clone();
      return ijk.clone().applyMatrix4(stack.ijk2LPS);
    },
    [stack],
  );

  const worldToData = useCallback(
    (lps: THREE.Vector3): THREE.Vector3 => {
      if (!stack) return lps.clone();
      return lps.clone().applyMatrix4(stack.lps2IJK);
    },
    [stack],
  );

  // Viewer may not exist yet on the very first render (store registers async)
  if (!viewer) return null;

  const ctxValue: DicomViewerContextType = {
    ...viewer,
    rawData: data,
    dataToWorld,
    worldToData,
    syncLocalizers: syncAll,
    viewportScenes,
    registerViewportScene,
  };

  const isLoading = viewer.isLoading || loading;

  return (
    <CanvasIdContext.Provider value={id}>
      <DicomViewerContext.Provider value={ctxValue}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {isLoading && (
            <div style={loadingOverlayStyle} aria-label="Loading DICOM data">
              Loading…
            </div>
          )}
          {error && (
            <div style={{ ...loadingOverlayStyle, backgroundColor: "rgba(180,0,0,0.6)" }}>
              Failed to load volume
            </div>
          )}
          {stack && (
            <DicomCanvas
              viewerId={id}
              viewMode={viewer.viewMode}
              orientation={viewer.orientation}
              stack={stack}
              animationSkipRate={animationSkipRate}
              onViewportReady={handleViewportReady}
              onViewport2DReady={handleViewport2DReady}
              onFps={onFps}
              onClick={onClick}
              onCtrlClick={onCtrlClick}
              onShiftClick={onShiftClick}
              onDoubleClick={onDoubleClick}
              onRightClick={onRightClick}
              onHover={onHover}
            >
              {/* R3F scene content: DicomLayer, DicomOverlay, custom three.js objects */}
              {children}
            </DicomCanvas>
          )}
          {/* DOM overlay: toolbar, HUD — rendered outside the WebGL Canvas so HTML
            elements are handled by the normal React DOM renderer, not R3F. */}
          {overlay}
        </div>
      </DicomViewerContext.Provider>
    </CanvasIdContext.Provider>
  );
};

export default DicomViewer;
