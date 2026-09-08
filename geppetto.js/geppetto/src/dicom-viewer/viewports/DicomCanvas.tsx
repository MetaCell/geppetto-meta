import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrientationMode,
  PlaneOrientation,
  ViewMode,
  ViewLayouts,
  PaneDescriptor,
  ViewportHandle,
  ViewportInteractions,
} from "../types";
import { Viewport2DContent } from "./Viewport2DContent";
import { Viewport3DContent } from "./Viewport3DContent";
import {
  createRenderScheduler,
  RenderSchedulerContext,
  useRenderScheduler,
} from "./renderScheduler";
import { useDicomViewerStore } from "../hooks/useDicomViewerStore";
import { useFiberStore } from "../canvas-context";

interface DicomCanvasProps {
  viewerId: string;
  viewMode: ViewMode;
  orientation: OrientationMode;
  stack: any | null;
  animationSkipRate: number;
  onViewport2DReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
  // Fires once every pane of the active view has painted its first frame.
  onRender?: (viewports: Readonly<Record<string, ViewportHandle>>, mode: string) => void;
  interactions?: ViewportInteractions;
  viewLayouts?: ViewLayouts;
  onFps?: (fps: number) => void;
  children?: React.ReactNode;
}

function StoreInvalidator({ viewerId }: { viewerId: string }) {
  const { invalidate } = useThree();
  const scheduler = useRenderScheduler();

  useEffect(() => {
    return useDicomViewerStore.subscribe((state, prev: any) => {
      if (state.viewers[viewerId] !== prev?.viewers[viewerId]) {
        // Marks the frame as "shared state moved" — see renderScheduler.ts / dev doc.
        scheduler.bumpSharedRevision();
        invalidate();
      }
    });
  }, [viewerId, invalidate, scheduler]);

  return null;
}

function FpsTracker({ onFps }: { onFps: (fps: number) => void }) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const decayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(decayTimer.current), []);

  useFrame(() => {
    frameCount.current += 1;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Reset the idle-decay timer on every frame
    clearTimeout(decayTimer.current);
    decayTimer.current = setTimeout(() => onFps(0), 600);

    if (elapsed >= 500) {
      onFps(Math.round((frameCount.current / elapsed) * 1000));
      frameCount.current = 0;
      lastTime.current = now;
    }
  });
  return null;
}

// CSS for a viewport tracking div in quad mode: top-left, top-right, bottom-left, bottom-right
const QUAD_STYLES: Record<OrientationMode, React.CSSProperties> = {
  "3d": { position: "absolute", top: 0, left: 0, width: "50%", height: "50%" },
  axial: { position: "absolute", top: 0, left: "50%", width: "50%", height: "50%" },
  sagittal: { position: "absolute", top: "50%", left: 0, width: "50%", height: "50%" },
  coronal: { position: "absolute", top: "50%", left: "50%", width: "50%", height: "50%" },
};

const HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  visibility: "hidden",
};

// The three 2D ids that get an automatic planeOrientation — see resolvePaneKind below.
const CANONICAL_PLANE_ORIENTATIONS = new Set(["axial", "sagittal", "coronal"]);

/*
 * Resolves a pane's actual kind/planeOrientation. For the four canonical ids, these are derived
 * from `id` and any value the descriptor set is ignored — a canonical pane's content isn't
 * something a view gets to redefine, only reposition (see PaneDescriptor's doc comment in
 * types.ts). For any other id, the descriptor must supply `kind` (and `planeOrientation` for a 2D
 * pane) itself, since there's nothing to derive it from.
 */
function resolvePaneKind(desc: PaneDescriptor): {
  kind: "3d" | "2d";
  planeOrientation?: PlaneOrientation;
} {
  if (desc.id === "3d") return { kind: "3d" };
  if (CANONICAL_PLANE_ORIENTATIONS.has(desc.id)) {
    return { kind: "2d", planeOrientation: desc.id as PlaneOrientation };
  }
  if (!desc.kind) {
    throw new Error(
      `PaneDescriptor "${desc.id}" needs an explicit kind — it isn't one of the built-in pane ids ` +
        `("3d"/"axial"/"sagittal"/"coronal"), which are the only ones with an inferred kind.`,
    );
  }
  return { kind: desc.kind, planeOrientation: desc.planeOrientation };
}

/*
 * The two built-in view modes, described as plain pane arrays — the same shape a custom view uses.
 * A consumer adding a custom mode spreads this map and adds its own array under a new key; see
 * doc/dev/dicom-viewer.md's "PaneDescriptor / ViewLayouts" entry.
 */
export const DEFAULT_VIEW_LAYOUTS: ViewLayouts = {
  quad_view: [
    { id: "3d", style: () => QUAD_STYLES["3d"] },
    { id: "axial", style: () => QUAD_STYLES.axial },
    { id: "sagittal", style: () => QUAD_STYLES.sagittal },
    { id: "coronal", style: () => QUAD_STYLES.coronal },
  ],
  single_view: [
    {
      id: "3d",
      style: activeOrientation =>
        activeOrientation === "3d" ? { position: "absolute", inset: 0 } : HIDDEN_STYLE,
    },
    {
      id: "axial",
      style: activeOrientation =>
        activeOrientation === "axial" ? { position: "absolute", inset: 0 } : HIDDEN_STYLE,
    },
    {
      id: "sagittal",
      style: activeOrientation =>
        activeOrientation === "sagittal" ? { position: "absolute", inset: 0 } : HIDDEN_STYLE,
    },
    {
      id: "coronal",
      style: activeOrientation =>
        activeOrientation === "coronal" ? { position: "absolute", inset: 0 } : HIDDEN_STYLE,
    },
  ],
};

function FiberRegister({ viewerId }: { viewerId: string }) {
  const state = useThree();
  const setRootState = useFiberStore(s => s.setRootState);
  const clearRootState = useFiberStore(s => s.clearRootState);
  useEffect(() => {
    setRootState(viewerId, state);
    return () => clearRootState(viewerId);
  }, [viewerId, state, setRootState, clearRootState]);
  return null;
}

// Wipes the whole canvas only when the layout changed — see doc/dev/dicom-viewer.md's FrameClearer entry.
function FrameClearer({
  viewMode,
  orientation,
}: {
  viewMode: ViewMode;
  orientation: OrientationMode;
}) {
  const { gl, size } = useThree();
  const scheduler = useRenderScheduler();

  // Pane rects move on layout/resize; anything newly uncovered must be wiped.
  useEffect(() => {
    scheduler.requestFullClear();
  }, [viewMode, orientation, size.width, size.height, scheduler]);

  useFrame(() => {
    // Priority -1: runs before every pane, so all panes see the same per-frame throttle decision.
    scheduler.beginFrame(performance.now());

    if (!scheduler.consumeFullClear()) return;
    gl.autoClear = true;
    gl.setScissorTest(false);
    gl.clear();
    gl.autoClear = false;
  }, -1);
  return null;
}

/*
 * Memoised as a backstop: its props are primitives and memoised callbacks, none of which change
 * when a slice does, so even if a parent re-renders for an unrelated reason, this subtree does not.
 */
const DicomCanvasImpl: React.FC<DicomCanvasProps> = ({
  viewerId,
  viewMode,
  orientation,
  stack,
  animationSkipRate,
  onViewport2DReady,
  onRender,
  interactions,
  viewLayouts,
  onFps,
  children,
}) => {
  const activePanes: PaneDescriptor[] =
    (viewLayouts ?? DEFAULT_VIEW_LAYOUTS)[viewMode] ?? DEFAULT_VIEW_LAYOUTS.single_view;

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((el: HTMLDivElement | null) => setContainerEl(el), []);

  // One scheduler per canvas, never module-level — see doc/dev/dicom-viewer.md's renderScheduler.ts entry.
  const schedulerRef = useRef<ReturnType<typeof createRenderScheduler> | undefined>(undefined);
  if (!schedulerRef.current) schedulerRef.current = createRenderScheduler();

  /*
   * Sticky mount: once a pane id has been part of an active view, it stays mounted (hidden via
   * style when not part of the current one) instead of being torn down. Recreating a pane's
   * camera/controls on every mode toggle is real cost — see doc/dev/dicom-viewer.md.
   */
  const [mountedIds, setMountedIds] = useState<string[]>(() => activePanes.map(p => p.id));
  useEffect(() => {
    setMountedIds(prev => {
      const missing = activePanes.filter(p => !prev.includes(p.id)).map(p => p.id);
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [activePanes]);

  // Per-pane tracking-div refs, created lazily and kept for the canvas' lifetime.
  const domRefsRef = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const getDomRef = (id: string): React.RefObject<HTMLDivElement> => {
    let ref = domRefsRef.current.get(id);
    if (!ref) {
      ref = React.createRef<HTMLDivElement>();
      domRefsRef.current.set(id, ref);
    }
    return ref;
  };

  /*
   * Last-known descriptor per pane id — lets a sticky-mounted-but-inactive pane keep rendering its
   * own content (kind/planeOrientation/...) even once it's no longer part of activePanes.
   */
  const descriptorByIdRef = useRef<Map<string, PaneDescriptor>>(new Map());
  activePanes.forEach(p => descriptorByIdRef.current.set(p.id, p));

  /*
   * Render-readiness tracking. `sceneByIdRef` captures each pane's scene/camera as soon as they
   * exist (onReady); `handlesByIdRef` only gets an entry once that pane has actually painted its
   * first frame (onFirstFrame) — a hidden/zero-size pane still fires this (see Viewport2/3DContent's
   * markFirstFrame placement) since there's nothing further to wait for. This one mechanism drives
   * both PaneDescriptor.onRender (per pane) and the top-level onRender prop (per view activation).
   */
  const sceneByIdRef = useRef<Map<string, { scene: any; camera: any }>>(new Map());
  const handlesByIdRef = useRef<Map<string, ViewportHandle>>(new Map());
  const paneFiredRef = useRef<Set<string>>(new Set());
  const aggregateRef = useRef<{ mode: string; fired: boolean }>({ mode: viewMode, fired: false });

  const checkReady = () => {
    /*
     * Scopes "siblings" to the view a pane belongs to — the view active when it first became ready
     * — so a pane never sees handles from an unrelated view it isn't actually part of.
     */
    const activeIds = new Set(activePanes.map(p => p.id));
    handlesByIdRef.current.forEach((handle, id) => {
      if (paneFiredRef.current.has(id)) return;
      paneFiredRef.current.add(id);
      const onPaneRender = descriptorByIdRef.current.get(id)?.onRender;
      if (onPaneRender) {
        const siblings: Record<string, ViewportHandle> = {};
        handlesByIdRef.current.forEach((h, hid) => {
          if (activeIds.has(hid)) siblings[hid] = h;
        });
        onPaneRender(handle, siblings);
      }
    });

    if (aggregateRef.current.mode !== viewMode) {
      aggregateRef.current = { mode: viewMode, fired: false };
    }
    if (aggregateRef.current.fired) return;
    const ids = activePanes.map(p => p.id);
    if (ids.length === 0 || !ids.every(id => handlesByIdRef.current.has(id))) return;
    aggregateRef.current = { mode: viewMode, fired: true };
    if (onRender) {
      const subset: Record<string, ViewportHandle> = {};
      ids.forEach(id => {
        subset[id] = handlesByIdRef.current.get(id)!;
      });
      onRender(subset, viewMode);
    }
  };

  // Re-check on mode switch — a sticky-mounted pane from an earlier activation may already be ready.
  useEffect(() => {
    checkReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activePanes]);

  const handlePaneReady = (id: string) => (scene: any, camera: any) => {
    sceneByIdRef.current.set(id, { scene, camera });
  };
  const handlePaneFirstFrame = (id: string) => () => {
    if (!handlesByIdRef.current.has(id)) {
      const sc = sceneByIdRef.current.get(id);
      if (sc) handlesByIdRef.current.set(id, { id, scene: sc.scene, camera: sc.camera });
    }
    checkReady();
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* One tracking div per mounted pane — defines each viewport's scissor region */}
      {mountedIds.map(id => {
        const desc = descriptorByIdRef.current.get(id);
        if (!desc) return null;
        const isActive = activePanes.some(p => p.id === id);
        const style = isActive
          ? typeof desc.style === "function"
            ? desc.style(orientation)
            : desc.style
          : HIDDEN_STYLE;
        return <div key={id} ref={getDomRef(id)} style={style} />;
      })}

      {/* Single canvas overlaid over the whole container — every pane renders imperatively inside
          this one WebGL context, each scissored to its own tracking div's bounds. */}
      {containerEl && (
        <Canvas
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          frameloop="demand"
          // antialias:false + preserveDrawingBuffer:true — see doc/dev/dicom-viewer.md's DicomCanvas.tsx entry.
          gl={{
            antialias: false,
            preserveDrawingBuffer: true,
            localClippingEnabled: true,
            autoClear: false,
          }}
          eventSource={containerEl}
          eventPrefix="client"
        >
          <RenderSchedulerContext.Provider value={schedulerRef.current}>
            {/* Wipes the canvas only when the layout changed; panes clear their own scissor rect */}
            <FrameClearer viewMode={viewMode} orientation={orientation} />
            {/* Register this canvas in useFiberStore so Toolbar3DButton can find it by viewerId */}
            <FiberRegister viewerId={viewerId} />
            {/* Invalidate on any store/context change so frameloop="demand" stays correct */}
            <StoreInvalidator viewerId={viewerId} />
            {onFps && <FpsTracker onFps={onFps} />}

            {mountedIds.map(id => {
              const desc = descriptorByIdRef.current.get(id);
              if (!desc) return null;
              const domRef = getDomRef(id);
              const { kind, planeOrientation } = resolvePaneKind(desc);
              if (kind === "3d") {
                return (
                  <Viewport3DContent
                    key={id}
                    id={id}
                    stack={stack}
                    domRef={domRef}
                    animationSkipRate={animationSkipRate}
                    onReady={handlePaneReady(id)}
                    onFirstFrame={handlePaneFirstFrame(id)}
                    interactions={interactions}
                  />
                );
              }
              return (
                <Viewport2DContent
                  key={id}
                  id={id}
                  stack={stack}
                  planeOrientation={planeOrientation!}
                  sliceColor={desc.sliceColor}
                  layerIds={desc.layerIds}
                  syncSliceWith={desc.syncSliceWith}
                  domRef={domRef}
                  animationSkipRate={animationSkipRate}
                  onReady={handlePaneReady(id)}
                  onFirstFrame={handlePaneFirstFrame(id)}
                  onHandleReady={onViewport2DReady}
                  interactions={interactions}
                />
              );
            })}

            {/* DicomOverlay and DicomLayer components render here */}
            {children}
          </RenderSchedulerContext.Provider>
        </Canvas>
      )}
    </div>
  );
};

export const DicomCanvas = React.memo(DicomCanvasImpl);
