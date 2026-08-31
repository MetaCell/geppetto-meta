import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrientationMode, PlaneOrientation, ViewMode, ClickAction, HoverAction } from "../types";
import { Viewport2DContent } from "./Viewport2DContent";
import { Viewport3DContent } from "./Viewport3DContent";
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

  useEffect(() => {
    return useDicomViewerStore.subscribe((state, prev: any) => {
      if (state.viewers[viewerId] !== prev?.viewers[viewerId]) {
        invalidate();
      }
    });
  }, [viewerId, invalidate]);

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
          gl={{ antialias: true, localClippingEnabled: true, autoClear: false }}
          eventSource={containerEl}
          eventPrefix="client"
        >
          {/* Clear canvas once per frame before any viewport renders */}
          <FrameClearer />
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
        </Canvas>
      )}
    </div>
  );
};
