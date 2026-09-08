import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DicomViewerContext } from "./DicomViewerContext";
import { CanvasIdContext } from "./canvas-context";
import { useDicomViewerStore, useDicomViewerStable } from "./hooks/useDicomViewerStore";
import { pctOf, useVolumeLoader } from "./hooks/useVolumeLoader";
import { useLocalizerSync, initLocalizerCrossRefs } from "./hooks/useLocalizerSync";
import { DicomCanvas } from "./viewports/DicomCanvas";
import {
  DicomViewerProps,
  DicomViewerContext as DicomViewerContextType,
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

export const DicomViewer: React.FC<DicomViewerProps> = ({
  id,
  data,
  assetLabel = "image",
  mode = "quad_view",
  viewLayouts,
  orientation = "3d",
  threshold3D,
  onLoaded,
  interactions,
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

  const viewer = useDicomViewerStable(id);

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

  const vpScenesRef = useRef<Partial<Record<string, THREE.Scene>>>({});
  const [viewportScenes, setViewportScenes] = useState<Partial<Record<string, THREE.Scene>>>({});

  const registerViewportScene = useCallback((vpId: string, scene: THREE.Scene) => {
    vpScenesRef.current = { ...vpScenesRef.current, [vpId]: scene };
    setViewportScenes(prev => ({ ...prev, [vpId]: scene }));

    const all = vpScenesRef.current;
    const scene3d = all["3d"];
    if (scene3d && all.axial && all.sagittal && all.coronal) {
      if (!scene3d.children.includes(all.axial)) scene3d.add(all.axial);
      if (!scene3d.children.includes(all.sagittal)) scene3d.add(all.sagittal);
      if (!scene3d.children.includes(all.coronal)) scene3d.add(all.coronal);
    }
  }, []);

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
        syncAll();
      }
    },
    [syncAll],
  );

  /*
   * DicomCanvas does all the per-pane readiness bookkeeping internally (see its checkReady) and
   * calls onRender once per view activation. This wraps that to (a) dismiss the loading overlay
   * and (b) forward to the consumer's own onRender, if any.
   */
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);
  const handleRenderComplete = useCallback(
    (viewports: Readonly<Record<string, ViewportHandle>>, renderedMode: string) => {
      setHasRenderedOnce(true);
      onRender?.(viewports, renderedMode);
    },
    [onRender],
  );

  // A new volume starts a new "first paint" cycle.
  useEffect(() => {
    setHasRenderedOnce(false);
  }, [data]);

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

  const ctxValue: DicomViewerContextType | null = useMemo(() => {
    if (!viewer) return null;
    return {
      ...viewer,
      rawData: data,
      dataToWorld,
      worldToData,
      syncLocalizers: syncAll,
      viewportScenes,
      registerViewportScene,
    };
  }, [viewer, data, dataToWorld, worldToData, syncAll, viewportScenes, registerViewportScene]);

  // Viewer may not exist yet on the very first render (store registers async)
  if (!viewer || !ctxValue) return null;

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
              onViewport2DReady={handleViewport2DReady}
              onRender={handleRenderComplete}
              onFps={onFps}
              interactions={interactions}
              viewLayouts={viewLayouts}
            >
              {/* R3F scene content: DicomLayer, DicomOverlay, custom three.js objects */}
              {children}
            </DicomCanvas>
          )}
          {/* DOM overlay: toolbar, HUD — rendered outside the WebGL Canvas */}
          {overlay}
        </div>
      </DicomViewerContext.Provider>
    </CanvasIdContext.Provider>
  );
};

export default DicomViewer;
