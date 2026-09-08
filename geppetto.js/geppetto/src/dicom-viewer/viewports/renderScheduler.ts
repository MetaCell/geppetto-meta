import React, { useContext } from "react";

// Per-pane render gating, scoped to one canvas — see doc/dev/dicom-viewer.md#viewportsrenderschedulerts
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

// How often sibling panes may redraw during an interaction — see dev doc for the tradeoff.
const SIBLING_REDRAW_INTERVAL_MS = 120;

// Safety valve if an interaction is abandoned without a matching endInteraction() — see dev doc.
const INTERACTION_STALE_MS = 3000;

// Named timestamp(), not now(): beginFrame takes a `now` param, shadowing it here would be a trap.
const timestamp = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function createRenderScheduler(): RenderScheduler {
  // Identity of the pane under an active pointer drag, or null when idle.
  let activePane: object | null = null;
  // Bumped whenever shared viewer state changes; panes compare against what they last drew.
  let sharedRevision = 0;
  // Whether the whole canvas must be wiped (layout changed) rather than per-pane.
  let fullClearPending = true;
  // Whether siblings may redraw this frame — decided once per frame in beginFrame.
  let siblingsAllowedThisFrame = true;
  let lastSiblingFrameAt = 0;
  // Refreshed on every touch so a live drag never goes stale while an abandoned one does.
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
      // A sibling redraws only when shared state moved AND its throttle window has elapsed.
      return siblingsAllowedThisFrame && lastDrawnRevision !== sharedRevision;
    },
  };
}

export const RenderSchedulerContext = React.createContext<RenderScheduler | null>(null);

// Rendered INSIDE <Canvas> — R3F's children use a separate reconciler, so a provider outside it never reaches the viewports.
export function useRenderScheduler(): RenderScheduler {
  const scheduler = useContext(RenderSchedulerContext);
  if (!scheduler) {
    throw new Error("useRenderScheduler must be used inside a DicomCanvas");
  }
  return scheduler;
}
