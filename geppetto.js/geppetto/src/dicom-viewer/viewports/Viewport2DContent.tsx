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
  domRef: React.RefObject<HTMLElement>;
  animationSkipRate: number;
  onReady?: (scene: any, camera: any) => void;
  /*
   * Exposes stackHelper + localizerHelper for localizer cross-ref initialisation. Only meaningful
   * (and only invoked) for a pane whose id equals its own orientation — see dev doc's
   * "localizer cross-refs stay canonical-only" note.
   */
  onHandleReady?: (plane: PlaneOrientation, stackHelper: any, localizerHelper: any) => void;
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
  domRef,
  animationSkipRate,
  onReady,
  onHandleReady,
  onFirstFrame,
  interactions,
}) => {
  const { gl, invalidate } = useThree();
  const handle = useViewport2D(stack, planeOrientation, sliceColor, domRef);
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
  // Per-instance identity for the render scheduler — see renderScheduler.ts / dev doc.
  const scheduler = useRenderScheduler();
  const paneId = useRef({}).current;
  const lastDrawnRevision = useRef(-1);
  const readyFired = useRef(false);
  const prevSliceIndex = useRef<number>(-1);
  /*
   * Wheel-scrub batching state, shared between the wheel listener and the sliceIndex round-trip
   * effect below.
   *
   * A single requestAnimationFrame guard only prevents a second flush within the SAME frame — it
   * says nothing about how long the dispatched change takes to actually land. Under software
   * rendering, the round trip (store write -> React commit -> the sliceIndex effect updating
   * handle.stackHelper.index) can span several frames. If a new flush were allowed to run before
   * that lands, it would compute `next` from a stale sh.index and could regress the slice position
   * (lose net scroll distance) rather than just be slow. updateInFlightRef closes that: a new flush
   * is only allowed once the round trip has actually updated stackHelper.index, at which point any
   * deltas that piled up while it was in flight are picked up in one shot.
   *
   * FLUSH_STALE_MS is a safety valve, same idea as renderScheduler's INTERACTION_STALE_MS: if the
   * round trip is somehow never observed (e.g. the dispatched value coincides with what the effect
   * already saw), scrubbing must resume on its own rather than stay stuck.
   */
  const FLUSH_STALE_MS = 500;
  const pendingDeltaRef = useRef(0);
  const flushHandleRef = useRef<number | undefined>(undefined);
  const updateInFlightRef = useRef(false);
  const flightStartedAtRef = useRef(0);

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
    ctx.setSliceIndex(sliceKey, next);
    invalidate();
  }, [handle, ctx, sliceKey, invalidate]);

  // Register the AMI scene in the DicomViewer context and fire callbacks once.
  useEffect(() => {
    if (!handle) return;
    ctx.registerViewportScene(id, handle.scene);
    if (!readyFired.current) {
      onReady?.(handle.scene, handle.camera);
      /*
       * Localizer cross-refs are a fixed axial/sagittal/coronal triangle (see useLocalizerSync.ts) —
       * only the canonical pane for each orientation (id === its own orientation) participates.
       */
      if (id === planeOrientation) {
        onHandleReady?.(planeOrientation, handle.stackHelper, handle.localizerHelper);
      }
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
        /*
         * In drawing-buffer pixels, not CSS pixels. AMI sizes the orthographic frustum from
         * camera.canvas, and the frustum has to span the same pixels gl.setViewport covers — which
         * is rect * (canvas.width / canvas.clientWidth). Passing CSS pixels made the frustum half
         * the viewport at devicePixelRatio 2: panes were positioned correctly (the scissor rects
         * were right) but showed a magnified crop, which reads as a broken layout. Equal at dpr 1,
         * which is why it stayed hidden until tested on a HiDPI screen.
         */
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
    ctx.syncLocalizers();
    handle.refreshOverlayMeshes(visibleLayers, stack);
    invalidate();
    /*
     * The wheel-scrub round trip (if any) has landed — release the flush gate and pick up
     * anything that piled up in pendingDeltaRef while it was in flight, see tryFlush's dev doc note.
     */
    updateInFlightRef.current = false;
    if (pendingDeltaRef.current !== 0 && flushHandleRef.current === undefined) {
      flushHandleRef.current = requestAnimationFrame(tryFlush);
    }
  }, [sliceIndex, handle, ctx.layers, layerIds, stack, tryFlush]);

  // Also refresh overlay meshes when the layers list (or this pane's layerIds filter) changes
  useEffect(() => {
    if (!handle?.stackHelper || !stack) return;
    handle.refreshOverlayMeshes(visibleLayers, stack);
    invalidate();
  }, [ctx.layers, layerIds, handle, stack]);

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

      /*
       * While a previous dispatch is still in flight, don't schedule another — the round-trip
       * effect above re-triggers tryFlush once it lands, picking up whatever piled up meanwhile.
       */
      if (flushHandleRef.current === undefined && !isFlushBusy()) {
        flushHandleRef.current = requestAnimationFrame(tryFlush);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      if (scrubEnd) clearTimeout(scrubEnd);
      if (flushHandleRef.current !== undefined) cancelAnimationFrame(flushHandleRef.current);
      el.removeEventListener("wheel", onWheel);
    };
  }, [handle, domRef.current, tryFlush, scheduler, paneId]);

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
    /*
     * Only the slot's own owner seeds it — a synced pane relies on whichever pane it's synced to
     * (already mounted, in practice always a canonical pane) to have already done this or to do it
     * itself; seeding here too would reset a shared slot back to the middle on every pane sharing
     * it that mounts later, undoing wherever the user had already navigated to.
     */
    if (!syncSliceWith) {
      ctx.setSliceIndex(sliceKey, Math.floor(maxIdx / 2));
    }
    ctx.setPlaneStackOrientation(planeOrientation, handle.camera.stackOrientation);
    invalidate();
  }, [handle?.stackHelper]);

  useFrame(() => {
    if (!handle || !domRef.current) return;

    /*
     * Fires as soon as this pane's render loop is alive — even while hidden/zero-size (a
     * sticky-mounted pane that isn't part of the active view). A hidden pane has nothing to paint,
     * so "ready" can't wait on real pixels the way a visible pane's readiness does below.
     */
    markFirstFrame();

    frameCount.current = (frameCount.current + 1) % animationSkipRate;
    if (frameCount.current !== 0) return;

    // Kept outside the render-skip below so an inertial camera keeps settling on skipped frames too.
    handle.controls.update();

    // Skips this frame's GL work when it isn't this pane's turn — see renderScheduler.ts / dev doc.
    if (!scheduler.shouldRenderPane(paneId, lastDrawnRevision.current)) return;
    lastDrawnRevision.current = scheduler.getSharedRevision();

    // --- Scissored render for this viewport ---
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    /*
     * Scale from CSS pixels to drawing-buffer pixels, measured from the canvas itself rather than
     * taken from gl.getPixelRatio(). The two disagree whenever the renderer's pixel ratio isn't
     * what actually sized the buffer — canvas.width/clientWidth is ground truth and cannot drift.
     */
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
