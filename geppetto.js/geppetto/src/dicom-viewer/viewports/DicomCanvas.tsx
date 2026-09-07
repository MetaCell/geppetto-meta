import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrientationMode, PlaneOrientation, ViewMode, ClickAction, HoverAction } from "../types";
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
  onViewportReady?: (id: number, scene: any, camera: any) => void;
  onViewport2DReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
  // Fires once the first real WebGL frame for viewport `id` has been painted
  onViewportFirstFrame?: (id: number) => void;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
  onFps?: (fps: number) => void;
  children?: React.ReactNode;
}

function StoreInvalidator({ viewerId }: { viewerId: string }) {
  const { invalidate } = useThree();
  const scheduler = useRenderScheduler();

  useEffect(() => {
    return useDicomViewerStore.subscribe((state, prev: any) => {
      if (state.viewers[viewerId] !== prev?.viewers[viewerId]) {
        /*
         * Marks the frame as "shared state moved", which is what lets the other panes redraw their
         * localizer crosshairs even while one pane is being dragged (see renderScheduler).
         */
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

/*
 * Wipes the whole canvas only when the layout changed. Per-frame clearing used to be
 * unconditional, which forced every pane to redraw every frame or be left blank - the thing that
 * made skipping idle panes impossible. Each pane now clears its own scissor rect just before
 * drawing, so a pane that skips a frame simply keeps its previous pixels.
 */
function FrameClearer({
  viewMode,
  orientation,
}: {
  viewMode: ViewMode;
  orientation: OrientationMode;
}) {
  const { gl, size } = useThree();
  const scheduler = useRenderScheduler();

  /*
   * Pane rects move when the view mode changes and when the canvas resizes; anything that is no
   * longer covered by a pane must be wiped or it keeps showing the old frame.
   */
  useEffect(() => {
    scheduler.requestFullClear();
  }, [viewMode, orientation, size.width, size.height, scheduler]);

  useFrame(() => {
    /*
     * Runs at priority -1, before every pane, so the sibling-throttle decision is made once per
     * frame and all panes see the same answer.
     */
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
  onViewportReady,
  onViewport2DReady,
  onViewportFirstFrame,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
  onFps,
  children,
}) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((el: HTMLDivElement | null) => setContainerEl(el), []);
  const r0Ref = useRef<HTMLDivElement>(null!); // 3d
  const r1Ref = useRef<HTMLDivElement>(null!); // axial
  const r2Ref = useRef<HTMLDivElement>(null!); // sagittal
  const r3Ref = useRef<HTMLDivElement>(null!); // coronal

  /*
   * One scheduler per canvas, never module-level: an app can mount several <DicomViewer>s on the
   * same page and a shared gate would let a drag in one freeze the others.
   */
  const schedulerRef = useRef<ReturnType<typeof createRenderScheduler> | undefined>(undefined);
  if (!schedulerRef.current) schedulerRef.current = createRenderScheduler();

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Four tracking divs that define viewport regions */}
      <div ref={r0Ref} style={viewportStyle("3d", viewMode, orientation)} />
      <div ref={r1Ref} style={viewportStyle("axial", viewMode, orientation)} />
      <div ref={r2Ref} style={viewportStyle("sagittal", viewMode, orientation)} />
      <div ref={r3Ref} style={viewportStyle("coronal", viewMode, orientation)} />

      {/* Single canvas overlaid over the whole container — all four viewports render
          imperatively inside this one WebGL context, each scissored to its tracking
          div's bounds. */}
      {containerEl && (
        <Canvas
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          frameloop="demand"
          /*
           * antialias:false - MSAA costs little on a GPU but is expensive under software rendering
           * (SwiftShader/llvmpipe), which is what a machine without hardware acceleration falls
           * back to. These panes are volume slices, where it buys almost nothing visually.
           * preserveDrawingBuffer:true is REQUIRED by the per-pane render gating: WebGL clears the
           * drawing buffer after every composite unless asked not to, so a pane that skips a frame
           * would render nothing and go black instead of keeping its previous pixels.
           */
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

            <Viewport3DContent
              stack={stack}
              domRef={r0Ref}
              animationSkipRate={animationSkipRate}
              onReady={(scene, camera) => onViewportReady?.(0, scene, camera)}
              onFirstFrame={() => onViewportFirstFrame?.(0)}
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
              onFirstFrame={() => onViewportFirstFrame?.(1)}
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
              onFirstFrame={() => onViewportFirstFrame?.(2)}
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
              onFirstFrame={() => onViewportFirstFrame?.(3)}
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
          </RenderSchedulerContext.Provider>
        </Canvas>
      )}
    </div>
  );
};

export const DicomCanvas = React.memo(DicomCanvasImpl);
