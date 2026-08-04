import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewport2D } from "./useViewport2D";
import { useDicomViewerContext } from "../DicomViewerContext";
import { useViewportEvents } from "../hooks/useViewportEvents";
import { PlaneOrientation, ClickAction, HoverAction } from "../types";

interface Viewport2DContentProps {
  stack: any | null;
  planeOrientation: PlaneOrientation;
  sliceColor: number;
  domRef: React.RefObject<HTMLElement>;
  animationSkipRate: number;
  onReady?: (scene: any, camera: any) => void;
  // Exposes stackHelper + localizerHelper for localizer cross-ref initialisation
  onHandleReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
}

export const Viewport2DContent: React.FC<Viewport2DContentProps> = ({
  stack,
  planeOrientation,
  sliceColor,
  domRef,
  animationSkipRate,
  onReady,
  onHandleReady,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
}) => {
  // size: canvas container dimensions — changes on resize, used to retrigger fitCamera
  const { size, gl, invalidate } = useThree();
  const handle = useViewport2D(stack, planeOrientation, sliceColor, domRef);
  const ctx = useDicomViewerContext();

  useViewportEvents({
    domRef,
    planeOrientation,
    camera: handle?.camera ?? null,
    scene: handle?.scene ?? null,
    onClick,
    onCtrlClick,
    onShiftClick,
    onDoubleClick,
    onRightClick,
    onHover,
  });
  const frameCount = useRef(0);
  const readyFired = useRef(false);
  const prevSliceIndex = useRef<number>(-1);

  // Register the AMI scene in the DicomViewer context and fire callbacks once.
  useEffect(() => {
    if (!handle) return;
    ctx.registerViewportScene(planeOrientation, handle.scene);
    if (!readyFired.current) {
      onReady?.(handle.scene, handle.camera);
      onHandleReady?.(planeOrientation, handle.stackHelper, handle.localizerHelper);
      readyFired.current = true;
    }
    invalidate();
  }, [handle]);

  /*
   * Invalidate from DOM pointer events so panning/zooming bootstraps the render
   * loop before controls.update() runs inside useFrame.
   */
  useEffect(() => {
    const el = domRef.current;
    if (!el || !handle) return undefined;
    let pressed = false;
    const onDown = () => {
      pressed = true;
      invalidate();
    };
    const onMove = () => {
      if (pressed) invalidate();
    };
    const onUp = () => {
      pressed = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [handle, domRef.current, invalidate]);

  // Recalculate camera frustum when the viewport is resized.
  useEffect(() => {
    if (!handle || !domRef.current) return;
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      handle.fitCamera({ width: rect.width, height: rect.height });
      invalidate();
    }
  }, [size, handle]);

  // Sync slice index from Zustand store → StackHelper, then refresh overlay meshes
  const sliceIndex = ctx.sliceIndices[planeOrientation];
  useEffect(() => {
    if (!handle?.stackHelper || sliceIndex === prevSliceIndex.current) return;
    prevSliceIndex.current = sliceIndex;
    handle.stackHelper.index = sliceIndex;
    ctx.syncLocalizers();
    handle.refreshOverlayMeshes(ctx.layers, stack);
    invalidate();
  }, [sliceIndex, handle, ctx.layers, stack]);

  // Also refresh overlay meshes when the layers list changes (new layer added/removed)
  useEffect(() => {
    if (!handle?.stackHelper || !stack) return;
    handle.refreshOverlayMeshes(ctx.layers, stack);
    invalidate();
  }, [ctx.layers, handle, stack]);

  // Slice navigation via scroll on the tracking div
  useEffect(() => {
    if (!handle || !domRef.current) return undefined;
    const el = domRef.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sh = handle.stackHelper;
      if (!sh) return;
      const delta = e.deltaY > 0 ? 1 : -1;
      const next = sh.index + delta;
      if (next < 0 || next > sh.orientationMaxIndex) return;
      ctx.setSliceIndex(planeOrientation, next);
      invalidate();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handle, domRef.current, planeOrientation, ctx.setSliceIndex]);

  // Publish max slice indices to context once stack helper is ready.
  useEffect(() => {
    if (!handle?.stackHelper) return;
    const maxIdx = handle.stackHelper.orientationMaxIndex;
    if (ctx.setSliceMaxIndex) {
      ctx.setSliceMaxIndex(planeOrientation, maxIdx);
    } else {
      ctx.setSliceMaxIndices({
        ...ctx.sliceMaxIndices,
        [planeOrientation]: maxIdx,
      });
    }
    ctx.setSliceIndex(planeOrientation, Math.floor(maxIdx / 2));
    ctx.setPlaneStackOrientation(planeOrientation, handle.camera.stackOrientation);
    invalidate();
  }, [handle?.stackHelper]);

  useFrame(() => {
    if (!handle || !domRef.current) return;

    frameCount.current = (frameCount.current + 1) % animationSkipRate;
    if (frameCount.current !== 0) return;

    handle.controls.update();

    // --- Scissored render for this viewport ---
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const dpr = gl.getPixelRatio();

    const x = Math.round((rect.left - canvasRect.left) * dpr);
    const y = Math.round((canvasRect.bottom - rect.bottom) * dpr);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    gl.setScissor(x, y, w, h);
    gl.setScissorTest(true);
    gl.setViewport(x, y, w, h);

    gl.render(handle.scene, handle.camera);

    if (handle.localizerHelper) {
      const lh = handle.localizerHelper;
      if (typeof lh.canvasWidth === "number" || "canvasWidth" in lh) {
        lh.canvasWidth = w;
        lh.canvasHeight = h;
      }
      if (lh._uniforms?.uViewportOffset) {
        lh._uniforms.uViewportOffset.value = [x, y];
      }
    }

    gl.clearDepth();
    gl.render(handle.localizerScene, handle.camera);

    gl.setScissorTest(false);
    gl.setViewport(0, 0, Math.round(canvasRect.width * dpr), Math.round(canvasRect.height * dpr));
  }, 1);

  return null;
};
