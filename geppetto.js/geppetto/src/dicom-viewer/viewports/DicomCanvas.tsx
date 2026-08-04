import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrientationMode, PlaneOrientation, ViewMode, ClickAction, HoverAction } from "../types";
import { Viewport2DContent } from "./Viewport2DContent";
import { Viewport3DContent } from "./Viewport3DContent";
import { useDicomViewerStore } from "../hooks/useDicomViewerStore";
import { useFiberStore, Canvas3DRootState } from "../../3d-canvas/Canvas3D";

interface DicomCanvasProps {
  viewerId: string;
  viewMode: ViewMode;
  orientation: OrientationMode;
  stack: any | null;
  animationSkipRate: number;
  onViewportReady?: (id: number, scene: any, camera: any) => void;
  onViewport2DReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
  onFps?: (fps: number) => void;
  children?: React.ReactNode;
}

/*
 * Subscribes directly to the Zustand store (not via React context) and calls
 * invalidate() only when this viewer's state actually changes.
 * Using the raw store subscription means zero React re-renders are involved —
 * no risk of creating a spurious render loop.
 */
function StoreInvalidator({ viewerId }: { viewerId: string }) {
  const { invalidate } = useThree();

  useEffect(() => {
    /*
     * Zustand v3 basic subscribe: listener(newState, prevState).
     * Using the single-argument form avoids the deprecated subscribeWithSelector
     * path (triggered whenever a second argument is present).
     */
    return useDicomViewerStore.subscribe((state, prev: any) => {
      if (state.viewers[viewerId] !== prev?.viewers[viewerId]) {
        invalidate();
      }
    });
  }, [viewerId, invalidate]);

  return null;
}

/*
 * Counts useFrame calls (= actual WebGL frames rendered) and reports via callback.
 * Must live inside the Canvas so it has access to the R3F render loop.
 * With frameloop="demand", useFrame stops firing when idle, so we schedule a
 * 600 ms decay timeout after each frame — if no new frame arrives in time the
 * counter resets to 0, giving an accurate "idle = 0 fps" reading.
 */
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
const QUAD_STYLES: Record<string, React.CSSProperties> = {
  "3d": { position: "absolute", top: 0, left: 0, width: "50%", height: "50%" },
  axial: { position: "absolute", top: 0, left: "50%", width: "50%", height: "50%" },
  sagittal: { position: "absolute", top: "50%", left: 0, width: "50%", height: "50%" },
  coronal: { position: "absolute", top: "50%", left: "50%", width: "50%", height: "50%" },
};

function viewportStyle(
  pane: OrientationMode,
  viewMode: ViewMode,
  activeOrientation: OrientationMode,
): React.CSSProperties {
  if (viewMode === "quad_view") {
    return QUAD_STYLES[pane];
  }
  // single_view — show only the active pane
  return pane === activeOrientation
    ? { position: "absolute", inset: 0 }
    : { position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden" };
}

const SLICE_COLORS = {
  axial: 0xff1744,
  sagittal: 0xffea00,
  coronal: 0x76ff03,
};

/*
 * Registers this DicomViewer's R3F canvas in the shared useFiberStore so that
 * Toolbar3DButton (and any component using useFiber) can look it up by viewerId.
 * Mirrors Canvas3D's FiberBridge — must live inside <Canvas> to call useThree().
 */
function FiberRegistrar({ viewerId }: { viewerId: string }) {
  const state = useThree();
  const setRootState = useFiberStore(s => s.setRootState);
  const clearRootState = useFiberStore(s => s.clearRootState);
  useEffect(() => {
    setRootState(viewerId, state as unknown as Canvas3DRootState);
    return () => clearRootState(viewerId);
  }, [viewerId, state, setRootState, clearRootState]);
  return null;
}

/*
 * Clears the entire canvas once at the start of each frame (priority -1, runs before
 * all viewport renders at priority 1).  Without this, old frames bleed through in
 * regions not covered by any viewport's gl.render() call.
 */
function FrameClearer() {
  const { gl } = useThree();
  useFrame(() => {
    gl.autoClear = true;
    gl.clear();
    gl.autoClear = false;
  }, -1);
  return null;
}

export const DicomCanvas: React.FC<DicomCanvasProps> = ({
  viewerId,
  viewMode,
  orientation,
  stack,
  animationSkipRate,
  onViewportReady,
  onViewport2DReady,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
  onFps,
  children,
}) => {
  /*
   * useState (not useRef) so the div's presence is known via React state — R3F's
   * eventSource is read once at <Canvas> mount, so a plain ref object (still null
   * on first render) would hand it a stale/empty eventSource. A callback ref lets
   * us delay mounting <Canvas> until the container div actually exists in the DOM.
   */
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((el: HTMLDivElement | null) => setContainerEl(el), []);
  const r0Ref = useRef<HTMLDivElement>(null!); // 3d
  const r1Ref = useRef<HTMLDivElement>(null!); // axial
  const r2Ref = useRef<HTMLDivElement>(null!); // sagittal
  const r3Ref = useRef<HTMLDivElement>(null!); // coronal

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Four tracking divs that define viewport regions.
          Viewport*Content reads their bounds to set the WebGL scissor/viewport. */}
      <div ref={r0Ref} style={viewportStyle("3d", viewMode, orientation)} />
      <div ref={r1Ref} style={viewportStyle("axial", viewMode, orientation)} />
      <div ref={r2Ref} style={viewportStyle("sagittal", viewMode, orientation)} />
      <div ref={r3Ref} style={viewportStyle("coronal", viewMode, orientation)} />

      {/* Single canvas overlaid over the whole container.
          We render all four viewports imperatively inside this one WebGL context,
          each scissored to its tracking div's bounds.
          pointer-events: none so tracking divs receive mouse/wheel events.
          R3F listens via eventSource={containerEl} so raycasting still works.
          containerEl is null on first render; <Canvas> only mounts once the div is in the DOM. */}
      {containerEl && (
        <Canvas
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          frameloop="demand"
          gl={{ antialias: true, localClippingEnabled: true, autoClear: false }}
          eventSource={containerEl}
          eventPrefix="client"
        >
          {/* Clear canvas once per frame before any viewport renders */}
          <FrameClearer />
          {/* Register this canvas in useFiberStore so Toolbar3DButton can find it by viewerId */}
          <FiberRegistrar viewerId={viewerId} />
          {/* Invalidate on any store/context change so frameloop="demand" stays correct */}
          <StoreInvalidator viewerId={viewerId} />
          {onFps && <FpsTracker onFps={onFps} />}

          <Viewport3DContent
            stack={stack}
            domRef={r0Ref}
            animationSkipRate={animationSkipRate}
            onReady={(scene, camera) => onViewportReady?.(0, scene, camera)}
            onClick={onClick}
            onCtrlClick={onCtrlClick}
            onShiftClick={onShiftClick}
            onDoubleClick={onDoubleClick}
            onRightClick={onRightClick}
            onHover={onHover}
          />

          <Viewport2DContent
            stack={stack}
            planeOrientation="axial"
            sliceColor={SLICE_COLORS.axial}
            domRef={r1Ref}
            animationSkipRate={animationSkipRate}
            onReady={(scene, camera) => onViewportReady?.(1, scene, camera)}
            onHandleReady={onViewport2DReady}
            onClick={onClick}
            onCtrlClick={onCtrlClick}
            onShiftClick={onShiftClick}
            onDoubleClick={onDoubleClick}
            onRightClick={onRightClick}
            onHover={onHover}
          />

          <Viewport2DContent
            stack={stack}
            planeOrientation="sagittal"
            sliceColor={SLICE_COLORS.sagittal}
            domRef={r2Ref}
            animationSkipRate={animationSkipRate}
            onReady={(scene, camera) => onViewportReady?.(2, scene, camera)}
            onHandleReady={onViewport2DReady}
            onClick={onClick}
            onCtrlClick={onCtrlClick}
            onShiftClick={onShiftClick}
            onDoubleClick={onDoubleClick}
            onRightClick={onRightClick}
            onHover={onHover}
          />

          <Viewport2DContent
            stack={stack}
            planeOrientation="coronal"
            sliceColor={SLICE_COLORS.coronal}
            domRef={r3Ref}
            animationSkipRate={animationSkipRate}
            onReady={(scene, camera) => onViewportReady?.(3, scene, camera)}
            onHandleReady={onViewport2DReady}
            onClick={onClick}
            onCtrlClick={onCtrlClick}
            onShiftClick={onShiftClick}
            onDoubleClick={onDoubleClick}
            onRightClick={onRightClick}
            onHover={onHover}
          />

          {/* DicomOverlay and DicomLayer components render here */}
          {children}
        </Canvas>
      )}
    </div>
  );
};
