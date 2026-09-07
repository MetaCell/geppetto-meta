import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewport2D } from "./useViewport2D";
import { useCanvasId } from "../canvas-context";
import { useDicomViewerContext } from "../DicomViewerContext";
import { useSliceIndices } from "../hooks/useDicomViewerStore";
import { useViewportEvents } from "../hooks/useViewportEvents";
import { PlaneOrientation, ClickAction, HoverAction } from "../types";
import { useFirstFrameFlag } from "./useFirstFrameFlag";
import { useRenderScheduler } from "./renderScheduler";

/*
 * How long the wheel must be quiet before a slice scrub counts as finished. Long enough to span the
 * gaps between ticks of one continuous scroll gesture, short enough that the sibling panes snap to
 * their final crosshair position without a visible pause.
 */
const SCRUB_IDLE_MS = 150;

interface Viewport2DContentProps {
  stack: any | null;
  planeOrientation: PlaneOrientation;
  sliceColor: number;
  domRef: React.RefObject<HTMLElement>;
  animationSkipRate: number;
  onReady?: (scene: any, camera: any) => void;
  // Exposes stackHelper + localizerHelper for localizer cross-ref initialisation
  onHandleReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
  // Fires once the first real WebGL frame for this viewport has been painted
  onFirstFrame?: () => void;
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
  onFirstFrame,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
}) => {
  const { gl, invalidate } = useThree();
  const handle = useViewport2D(stack, planeOrientation, sliceColor, domRef);
  const ctx = useDicomViewerContext();
  const markFirstFrame = useFirstFrameFlag(handle, onFirstFrame);

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
  /*
   * Per-instance identity for the render scheduler; object identity avoids needing a naming scheme
   * that stays unique across view modes.
   */
  const scheduler = useRenderScheduler();
  const paneId = useRef({}).current;
  const lastDrawnRevision = useRef(-1);
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

  useEffect(() => {
    const el = domRef.current;
    if (!el || !handle) return undefined;
    let pressed = false;
    const onDown = () => {
      pressed = true;
      // Tells the scheduler that only this pane needs redrawing while the drag lasts.
      scheduler.beginInteraction(paneId);
      invalidate();
    };
    const onMove = () => {
      if (pressed) invalidate();
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      // Releases the gate and forces one all-panes frame so anything skipped mid-drag catches up.
      scheduler.endInteraction();
      invalidate();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    /*
     * pointerup/pointercancel are bound to WINDOW, not the pane: releasing the mouse outside the
     * pane it was pressed in is routine, and a release that never reaches this element would leave
     * the interaction gate latched on forever - every other pane then stops redrawing until some
     * viewer-store write happens to bump the shared revision.
     */
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    // A drag interrupted by the tab losing focus never produces a pointerup at all.
    window.addEventListener("blur", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [handle, domRef.current, invalidate, scheduler, paneId]);

  useEffect(() => {
    const el = domRef.current;
    if (!handle || !el) return undefined;
    const applyFit = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        handle.fitCamera({ width: rect.width, height: rect.height });
        invalidate();
      }
    };
    applyFit();
    const observer = new ResizeObserver(applyFit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [handle, domRef.current]);

  /*
   * Sync slice index from Zustand store → StackHelper, then refresh overlay meshes
   * Subscribed directly rather than read off the context: this is the value that changes on every
   * scrub tick, and routing it through the context re-rendered every consumer in the viewer.
   */
  const sliceIndices = useSliceIndices(useCanvasId());
  const sliceIndex = sliceIndices?.[planeOrientation] ?? 0;
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

    /*
     * A wheel scrub has no pointerdown/up to bracket it, so it is treated as an interaction that
     * ends once the wheel goes quiet. Without this, scrubbing bumps the shared revision on every
     * tick and every sibling pane redraws at full rate.
     */
    let scrubEnd: ReturnType<typeof setTimeout> | undefined;
    /*
     * Wheel events fire far faster than frames - a trackpad emits well over 60/s - and each
     * setSliceIndex writes the store, which produces a new viewer record and re-renders every
     * consumer. Ticks are accumulated and applied once per animation frame instead, so a burst
     * costs one cascade rather than one per event. The same number of slices is traversed.
     */
    let pendingDelta = 0;
    let flushHandle: number | undefined;

    const flush = () => {
      flushHandle = undefined;
      const sh = handle.stackHelper;
      const delta = pendingDelta;
      pendingDelta = 0;
      if (!sh || delta === 0) return;
      const next = Math.min(Math.max(sh.index + delta, 0), sh.orientationMaxIndex);
      if (next === sh.index) return;
      ctx.setSliceIndex(planeOrientation, next);
      invalidate();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!handle.stackHelper) return;
      pendingDelta += e.deltaY > 0 ? 1 : -1;

      scheduler.beginInteraction(paneId);
      if (scrubEnd) clearTimeout(scrubEnd);
      scrubEnd = setTimeout(() => {
        scheduler.endInteraction();
        invalidate();
      }, SCRUB_IDLE_MS);

      if (flushHandle === undefined) flushHandle = requestAnimationFrame(flush);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      if (scrubEnd) clearTimeout(scrubEnd);
      if (flushHandle !== undefined) cancelAnimationFrame(flushHandle);
      el.removeEventListener("wheel", onWheel);
    };
  }, [handle, domRef.current, planeOrientation, ctx.setSliceIndex, scheduler, paneId]);

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

    /*
     * Kept outside the skip below so a damped/inertial camera keeps settling even on frames this
     * pane does not draw - only the GL work is skipped, never the state update.
     */
    handle.controls.update();

    /*
     * While another pane is being dragged this one holds its previous pixels instead of redrawing
     * (see renderScheduler). It still draws whenever shared state moved, which is what keeps the
     * localizer crosshair in step while slices are scrubbed in a sibling pane.
     */
    if (!scheduler.shouldRenderPane(paneId, lastDrawnRevision.current)) return;
    lastDrawnRevision.current = scheduler.getSharedRevision();

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
    /*
     * Clear just this pane's rect. The canvas is no longer wiped wholesale each frame (that would
     * blank any pane which skips), and gl.clear() honours the scissor box, so this stays local.
     */
    gl.autoClear = true;
    gl.clear();
    gl.autoClear = false;

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

    markFirstFrame();
  }, 1);

  return null;
};
