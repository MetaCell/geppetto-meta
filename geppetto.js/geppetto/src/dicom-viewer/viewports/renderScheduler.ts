import React, { useContext } from "react";

/*
 * Per-pane render gating, scoped to ONE canvas.
 *
 * Every pane (3D + the 3 orthogonal planes) renders into one <Canvas frameloop="demand"> through
 * its own scissor rect. Because each pane owns a useFrame, a single invalidate() - one mouse move -
 * re-renders all of them. On a GPU that is free; under software rendering (SwiftShader/llvmpipe,
 * what a machine without hardware acceleration falls back to) it is a 4x CPU multiplier on every
 * pointer move.
 *
 * The rule that fixes this without losing correctness:
 *
 *   during a drag, render only the pane being dragged - UNLESS shared viewer state changed this
 *   frame, in which case every pane renders.
 *
 * That exception keeps the localizer crosshairs live: scrubbing slices writes sliceIndices into
 * useDicomViewerStore, which bumps the revision, so sibling planes redraw their crosshair on the
 * same frame. Orbiting the 3D pane touches no shared state, so the 2D panes correctly sit still.
 *
 * ONE INSTANCE PER CANVAS, never module-level state: an app can mount several <DicomViewer>s on
 * the same page, and a module-global gate would let a drag in one freeze the panes of all the
 * others. Each DicomCanvas creates its own and provides it to its subtree.
 *
 * Read imperatively from useFrame rather than through React state - it is consulted every frame and
 * must never trigger a re-render.
 */
export interface RenderScheduler {
  beginInteraction(pane: object): void;
  endInteraction(): void;
  beginFrame(now: number): void;
  bumpSharedRevision(): void;
  getSharedRevision(): number;
  requestFullClear(): void;
  consumeFullClear(): boolean;
  shouldRenderPane(pane: object, lastDrawnRevision: number): boolean;
}

/*
 * How often panes OTHER than the one being interacted with may redraw, while an interaction is in
 * progress. Scrubbing slices moves the localizer crosshair in every sibling plane, so they cannot
 * simply be frozen - but they do not need 60fps either. At ~8fps the crosshair still tracks
 * visibly while the sibling panes cost a fraction of what a full-rate redraw costs, which is what
 * makes wheel-scrubbing cheap on a machine without hardware acceleration. Siblings always get a
 * final frame when the interaction ends, so nothing is left stale.
 */
const SIBLING_REDRAW_INTERVAL_MS = 120;

/*
 * Safety valve. The gate is only ever released by an explicit endInteraction(), so any path that
 * fails to deliver one latches it on and silently freezes every other pane - which is exactly what
 * happened when pointerup landed outside the pane it started in. Window-level listeners fix that
 * particular case, but a latched gate degrades so quietly (no error, panes simply stop updating)
 * that it is worth making it impossible rather than merely fixed. No genuine drag consists of a
 * pointerdown with no further activity for this long.
 */
const INTERACTION_STALE_MS = 3000;

/*
 * Named timestamp(), not now(): beginFrame takes a `now` parameter and shadowing it here would be
 * a silent trap for anyone adding a call inside that function.
 */
const timestamp = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function createRenderScheduler(): RenderScheduler {
  /*
   * Identity of the pane under an active pointer drag, or null when idle. Panes pass a
   * per-instance object, so no naming scheme has to stay unique across view modes.
   */
  let activePane: object | null = null;
  // Bumped whenever shared viewer state changes; panes compare against what they last drew.
  let sharedRevision = 0;
  /*
   * Set when the canvas must be wiped in full rather than per-pane: the layout changed, so pixels
   * outside the new pane rects (the margins beside the centred 3D pane, a pane that just
   * unmounted) would otherwise keep showing the previous frame - nothing draws over them.
   */
  let fullClearPending = true;
  /*
   * Whether siblings of the interacted pane are permitted to redraw on the current frame. Decided
   * once per frame (beginFrame) rather than per pane, so every sibling updates on the same frame
   * instead of tearing across several.
   */
  let siblingsAllowedThisFrame = true;
  let lastSiblingFrameAt = 0;
  /*
   * Refreshed by beginInteraction and by every frame the active pane draws, so a live drag never
   * goes stale while an abandoned one does.
   */
  let interactionTouchedAt = 0;

  return {
    beginInteraction(pane) {
      activePane = pane;
      interactionTouchedAt = timestamp();
    },
    endInteraction() {
      activePane = null;
      // One all-panes frame so anything skipped mid-drag catches up.
      sharedRevision++;
    },
    beginFrame(now) {
      if (activePane !== null && now - interactionTouchedAt > INTERACTION_STALE_MS) {
        // Abandoned interaction - release it rather than leaving the other panes frozen.
        activePane = null;
        sharedRevision++;
      }
      if (activePane === null) {
        siblingsAllowedThisFrame = true;
        return;
      }
      siblingsAllowedThisFrame = now - lastSiblingFrameAt >= SIBLING_REDRAW_INTERVAL_MS;
      if (siblingsAllowedThisFrame) {
        lastSiblingFrameAt = now;
      }
    },
    bumpSharedRevision() {
      sharedRevision++;
    },
    getSharedRevision() {
      return sharedRevision;
    },
    requestFullClear() {
      fullClearPending = true;
      // A full wipe blanks every pane, so they must all redraw on that frame.
      sharedRevision++;
    },
    consumeFullClear() {
      const pending = fullClearPending;
      fullClearPending = false;
      return pending;
    },
    shouldRenderPane(pane, lastDrawnRevision) {
      // Idle: behave exactly as before the gating existed.
      if (activePane === null) return true;
      // The pane being interacted with must always be at full rate - it is the one being watched.
      if (activePane === pane) {
        interactionTouchedAt = timestamp();
        return true;
      }
      /*
       * A sibling redraws only when shared state actually moved (scrubbing moves crosshairs;
       * orbiting the 3D pane does not) AND its throttle window has elapsed.
       */
      return siblingsAllowedThisFrame && lastDrawnRevision !== sharedRevision;
    },
  };
}

export const RenderSchedulerContext = React.createContext<RenderScheduler | null>(null);

/*
 * The provider is rendered INSIDE <Canvas>. R3F runs its children through a separate reconciler, so
 * a provider placed outside the canvas would not reach the viewports.
 */
export function useRenderScheduler(): RenderScheduler {
  const scheduler = useContext(RenderSchedulerContext);
  if (!scheduler) {
    throw new Error("useRenderScheduler must be used inside a DicomCanvas");
  }
  return scheduler;
}
