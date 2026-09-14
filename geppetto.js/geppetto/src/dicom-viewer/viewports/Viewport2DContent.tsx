import React, { useCallback, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewport2D } from "./useViewport2D";
import { useCanvasId } from "../canvas-context";
import { useDicomViewerContext } from "../DicomViewerContext";
import { useSliceIndices } from "../hooks/useDicomViewerStore";
import { useViewportEvents } from "../hooks/useViewportEvents";
import { PlaneOrientation, ViewportInteractions } from "../types";
import { useFirstFrameFlag } from "./useFirstFrameFlag";
import { useRenderScheduler } from "./renderScheduler";

// How long the wheel must be quiet before a slice scrub counts as finished — see dev doc.
const SCRUB_IDLE_MS = 150;

// Crosshair tint fallback when a PaneDescriptor doesn't set its own sliceColor.
const DEFAULT_SLICE_COLORS: Record<PlaneOrientation, number> = {
  axial: 0xff1744,
  sagittal: 0xffea00,
  coronal: 0x76ff03,
};

interface Viewport2DContentProps {
  id: string;
  stack: any | null;
  planeOrientation: PlaneOrientation;
  sliceColor?: number;
  layerIds?: string[];
  // Own slice slot defaults to `id`; set to another pane's id to read/write that pane's slot instead.
  syncSliceWith?: string;
  // Forces this pane's overlay layer(s) fully opaque with an independent LUT, hides the base slice.
  soloMode?: boolean;
  soloLutName?: string;
  domRef: React.RefObject<HTMLElement>;
  animationSkipRate: number;
  onReady?: (scene: any, camera: any) => void;
  /*
   * Exposes id/syncSliceWith/stackHelper/localizerHelper for localizer cross-ref bookkeeping —
   * fires for every pane. See the dev docs for how DicomViewer routes this.
   */
  onHandleReady?: (
    id: string,
    plane: PlaneOrientation,
    stackHelper: any,
    localizerHelper: any,
    syncSliceWith?: string,
  ) => void;
  // Fires once the first real WebGL frame for this viewport has been painted
  onFirstFrame?: () => void;
  interactions?: ViewportInteractions;
}

export const Viewport2DContent: React.FC<Viewport2DContentProps> = ({
  id,
  stack,
  planeOrientation,
  sliceColor = DEFAULT_SLICE_COLORS[planeOrientation],
  layerIds,
  syncSliceWith,
  soloMode = false,
  soloLutName,
  domRef,
  animationSkipRate,
  onReady,
  onHandleReady,
  onFirstFrame,
  interactions,
}) => {
  const { gl, invalidate } = useThree();
  const handle = useViewport2D(stack, planeOrientation, sliceColor, domRef, soloMode);
  const ctx = useDicomViewerContext();
  const markFirstFrame = useFirstFrameFlag(handle, onFirstFrame);
  const visibleLayers = layerIds ? ctx.layers.filter(l => layerIds.includes(l.id)) : ctx.layers;
  // This pane's own slot by default; synced panes share another pane's slot instead — see dev doc.
  const sliceKey = syncSliceWith ?? id;

  useViewportEvents({
    domRef,
    planeOrientation,
    camera: handle?.camera ?? null,
    scene: handle?.scene ?? null,
    interactions,
  });
  const frameCount = useRef(0);
  // Per-instance identity for the render scheduler.
  const scheduler = useRenderScheduler();
  const paneId = useRef({}).current;
  const lastDrawnRevision = useRef(-1);
  const readyFired = useRef(false);
  const prevSliceIndex = useRef<number>(-1);
  /*
   * Wheel-scrub batching state, shared between the wheel listener and the sliceIndex round-trip
   * effect below — see the dev docs for the fail-open mechanism this implements.
   */
  const FLUSH_STALE_MS = 500;
  const pendingDeltaRef = useRef(0);
  const flushHandleRef = useRef<number | undefined>(undefined);
  const updateInFlightRef = useRef(false);
  const flightStartedAtRef = useRef(0);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /*
   * Assigned below — lets the wheel listener and the sliceIndex effect call the current
   * scheduleFlush without needing it in their own dependency arrays.
   */
  const scheduleFlushRef = useRef<(() => void) | undefined>(undefined);

  const isFlushBusy = () =>
    updateInFlightRef.current && Date.now() - flightStartedAtRef.current < FLUSH_STALE_MS;

  const tryFlush = useCallback(() => {
    flushHandleRef.current = undefined;
    const sh = handle?.stackHelper;
    const delta = pendingDeltaRef.current;
    pendingDeltaRef.current = 0;
    if (!sh || delta === 0) return;
    const next = Math.min(Math.max(sh.index + delta, 0), sh.orientationMaxIndex);
    if (next === sh.index) return;
    updateInFlightRef.current = true;
    flightStartedAtRef.current = Date.now();
    clearTimeout(flushTimeoutRef.current);
    flushTimeoutRef.current = setTimeout(() => {
      updateInFlightRef.current = false;
      if (pendingDeltaRef.current !== 0) scheduleFlushRef.current?.();
    }, FLUSH_STALE_MS);
    ctx.setSliceIndex(sliceKey, next);
    invalidate();
  }, [handle, ctx, sliceKey, invalidate]);

  const scheduleFlush = useCallback(() => {
    if (isFlushBusy() || flushHandleRef.current !== undefined) return;
    flushHandleRef.current = requestAnimationFrame(tryFlush);
  }, [tryFlush]);
  scheduleFlushRef.current = scheduleFlush;

  useEffect(
    () => () => {
      if (flushHandleRef.current !== undefined) cancelAnimationFrame(flushHandleRef.current);
      clearTimeout(flushTimeoutRef.current);
    },
    [],
  );

  // Register the AMI scene in the DicomViewer context and fire callbacks once.
  useEffect(() => {
    if (!handle) return;
    ctx.registerViewportScene(id, handle.scene);
    if (!readyFired.current) {
      onReady?.(handle.scene, handle.camera);
      onHandleReady?.(
        id,
        planeOrientation,
        handle.stackHelper,
        handle.localizerHelper,
        syncSliceWith,
      );
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
    // pointerup/pointercancel bound to WINDOW, not the pane — see dev doc's "release-outside-pane fix".
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
        // fitCamera needs drawing-buffer pixels, not CSS pixels — see the dev docs (HiDPI fix).
        const canvas = gl.domElement;
        const canvasRect = canvas.getBoundingClientRect();
        const sx = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
        const sy = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;
        handle.fitCamera({ width: rect.width * sx, height: rect.height * sy });
        invalidate();
      }
    };
    applyFit();
    const observer = new ResizeObserver(applyFit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [handle, domRef.current, gl]);

  // Subscribed directly, not off the context — see dev doc's "sliceIndices omitted" note.
  const sliceIndices = useSliceIndices(useCanvasId());
  const sliceIndex = sliceIndices?.[sliceKey] ?? 0;
  useEffect(() => {
    if (!handle?.stackHelper || sliceIndex === prevSliceIndex.current) return;
    prevSliceIndex.current = sliceIndex;
    handle.stackHelper.index = sliceIndex;
    // A soloMode pane never computes its own cross-ref equations — it mirrors a synced sibling's.
    if (!soloMode) ctx.syncLocalizers();
    handle.refreshOverlayMeshes(visibleLayers, stack, soloMode, soloLutName);
    invalidate();
    /*
     * The wheel-scrub round trip (if any) has landed — release the flush gate and pick up
     * anything that piled up while it was in flight.
     */
    updateInFlightRef.current = false;
    clearTimeout(flushTimeoutRef.current);
    if (pendingDeltaRef.current !== 0) scheduleFlushRef.current?.();
  }, [sliceIndex, handle, ctx.layers, layerIds, stack, soloMode, soloLutName]);

  // Also refresh overlay meshes when the layers list (or this pane's layerIds filter) changes
  useEffect(() => {
    if (!handle?.stackHelper || !stack) return;
    handle.refreshOverlayMeshes(visibleLayers, stack, soloMode, soloLutName);
    invalidate();
  }, [ctx.layers, layerIds, handle, stack, soloMode, soloLutName]);

  // Slice navigation via scroll on the tracking div
  useEffect(() => {
    if (!handle || !domRef.current) return undefined;
    const el = domRef.current;

    // A wheel scrub has no pointerdown/up to bracket it — ends once the wheel goes quiet, see dev doc.
    let scrubEnd: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!handle.stackHelper) return;
      pendingDeltaRef.current += e.deltaY > 0 ? 1 : -1;

      scheduler.beginInteraction(paneId);
      if (scrubEnd) clearTimeout(scrubEnd);
      scrubEnd = setTimeout(() => {
        scheduler.endInteraction();
        invalidate();
      }, SCRUB_IDLE_MS);

      // A dispatch already in flight re-triggers this itself once it clears — see scheduleFlush.
      scheduleFlushRef.current?.();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      if (scrubEnd) clearTimeout(scrubEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, [handle, domRef.current, scheduler, paneId]);

  /*
   * Publish max slice indices to context once stack helper is ready. Skipped in soloMode: a
   * sibling pane for the same plane already owns this bookkeeping.
   */
  useEffect(() => {
    if (!handle?.stackHelper || soloMode) return;
    const maxIdx = handle.stackHelper.orientationMaxIndex;
    if (ctx.setSliceMaxIndex) {
      ctx.setSliceMaxIndex(planeOrientation, maxIdx);
    } else {
      ctx.setSliceMaxIndices({
        ...ctx.sliceMaxIndices,
        [planeOrientation]: maxIdx,
      });
    }
    /*
     * Only the slot's own owner seeds it — a synced pane relies on the pane it's synced to for
     * this, or seeding here too would reset an already-navigated shared slot back to the middle.
     */
    if (!syncSliceWith) {
      ctx.setSliceIndex(sliceKey, Math.floor(maxIdx / 2));
    }
    ctx.setPlaneStackOrientation(planeOrientation, handle.camera.stackOrientation);
    invalidate();
  }, [handle?.stackHelper, soloMode]);

  useFrame(() => {
    if (!handle || !domRef.current) return;

    /*
     * Fires as soon as this pane's render loop is alive, even hidden/zero-size — a hidden pane
     * has nothing to paint, so "ready" can't wait on real pixels the way a visible pane's does.
     */
    markFirstFrame();

    frameCount.current = (frameCount.current + 1) % animationSkipRate;
    if (frameCount.current !== 0) return;

    // Kept outside the render-skip below so an inertial camera keeps settling on skipped frames too.
    handle.controls.update();

    // Skips this frame's GL work when it isn't this pane's turn.
    if (!scheduler.shouldRenderPane(paneId, lastDrawnRevision.current)) return;
    lastDrawnRevision.current = scheduler.getSharedRevision();

    // --- Scissored render for this viewport ---
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    // Scale from CSS to drawing-buffer pixels, measured from the canvas itself — see the dev docs.
    const sx = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
    const sy = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;

    const x = Math.round((rect.left - canvasRect.left) * sx);
    const y = Math.round((canvasRect.bottom - rect.bottom) * sy);
    const w = Math.round(rect.width * sx);
    const h = Math.round(rect.height * sy);

    gl.setScissor(x, y, w, h);
    gl.setScissorTest(true);
    gl.setViewport(x, y, w, h);
    // Clear just this pane's scissor rect — the canvas is no longer wiped wholesale each frame.
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
    gl.setViewport(0, 0, canvas.width, canvas.height);
  }, 1);

  return null;
};
