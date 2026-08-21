import { useEffect, useRef } from "react";

/*
 * Fires onFirstFrame once per `handle` identity, the first time the caller's
 * render path actually completes — not just when the handle (scene/camera)
 * exists, which only means the data is ready, not that anything has painted.
 * Shared by Viewport2DContent/Viewport3DContent since both need the exact
 * same "fire once per handle" bookkeeping around otherwise-unrelated render
 * bodies (2D's slice + localizer passes vs. 3D's light-follow/threshold/
 * overlay-hiding logic).
 */
export function useFirstFrameFlag(handle: unknown, onFirstFrame?: () => void): () => void {
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [handle]);

  return () => {
    if (!firedRef.current) {
      firedRef.current = true;
      onFirstFrame?.();
    }
  };
}
