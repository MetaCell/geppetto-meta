import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DicomViewerContext } from "./DicomViewerContext";
import { CanvasIdContext } from "../3d-canvas/toolbar/Toolbar3D";
import { useDicomViewerStore, useDicomViewer } from "./hooks/useDicomViewerStore";
import { pctOf, useVolumeLoader } from "./hooks/useVolumeLoader";
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
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "#fff",
  fontSize: "0.875rem",
  letterSpacing: "0.05em",
  zIndex: 10,
  pointerEvents: "none",
};

const progressBarTrackStyle: React.CSSProperties = {
  width: 200,
  height: 4,
  borderRadius: 2,
  backgroundColor: "rgba(255,255,255,0.25)",
  overflow: "hidden",
};

// Maps each viewport pane to the numeric id DicomCanvas/onViewportReady use for it
const VP_ID_MAP: Record<OrientationMode, number> = { "3d": 0, axial: 1, sagittal: 2, coronal: 3 };

export const DicomViewer: React.FC<DicomViewerProps> = ({
  id,
  data,
  assetLabel = "image",
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
  const { stack, loading, error, downloadProgress } = useVolumeLoader(data);

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
   * "Has anything actually painted yet" tracking, for the loading overlay.
   * A stack existing only means the data decoded — StackHelper/DataTexture
   * construction still has to run and a WebGL frame still has to be drawn
   * before the user sees anything. Viewport*Content's useFrame calls
   * markFirstFrame() (via useFirstFrameFlag) once their render pass actually
   * completes; this tracks that across however many viewports are relevant
   * for the current viewMode/orientation.
   * ---------------------------------------------------------------------------
   */
  const renderedViewportsRef = useRef<Set<number>>(new Set());
  const expectedViewportIdsRef = useRef<Set<number>>(new Set([0, 1, 2, 3]));
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);

  // A new volume starts a new "first paint" cycle
  useEffect(() => {
    renderedViewportsRef.current.clear();
    setHasRenderedOnce(false);
  }, [data]);

  // single_view only ever renders the active pane, so that's all we should wait on
  useEffect(() => {
    const expected =
      viewer && viewer.viewMode === "single_view"
        ? new Set([VP_ID_MAP[viewer.orientation]])
        : new Set([0, 1, 2, 3]);
    expectedViewportIdsRef.current = expected;
    if ([...expected].every(vpId => renderedViewportsRef.current.has(vpId))) {
      setHasRenderedOnce(true);
    }
  }, [viewer?.viewMode, viewer?.orientation]);

  const handleViewportFirstFrame = useCallback((vpId: number) => {
    renderedViewportsRef.current.add(vpId);
    const expected = expectedViewportIdsRef.current;
    if ([...expected].every(expectedId => renderedViewportsRef.current.has(expectedId))) {
      setHasRenderedOnce(true);
    }
  }, []);

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
  // stack ready but nothing painted yet: StackHelper/DataTexture setup + first WebGL frame still pending
  const isDecoding = !!stack && !hasRenderedOnce;
  const showLoadingOverlay = isLoading || isDecoding;
  const downloadPct = pctOf(downloadProgress);
  const downloadLabel = isDecoding
    ? `Decoding ${assetLabel}…`
    : downloadPct !== null
      ? `Loading ${assetLabel}… ${downloadPct}%`
      : `Loading ${assetLabel}…`;

  return (
    <CanvasIdContext.Provider value={id}>
      <DicomViewerContext.Provider value={ctxValue}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <style>{`@keyframes dicom-viewer-indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
          {showLoadingOverlay && (
            <div style={loadingOverlayStyle} aria-label="Loading DICOM data">
              <span>{downloadLabel}</span>
              <div style={progressBarTrackStyle}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    width: downloadPct !== null ? `${downloadPct}%` : "40%",
                    transition: downloadPct !== null ? "width 0.2s ease" : "none",
                    animation:
                      downloadPct === null
                        ? "dicom-viewer-indeterminate 1.4s linear infinite"
                        : "none",
                  }}
                />
              </div>
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
              onViewportFirstFrame={handleViewportFirstFrame}
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
