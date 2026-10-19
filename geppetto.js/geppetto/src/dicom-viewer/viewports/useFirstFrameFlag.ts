import { useEffect, useRef } from "react";

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
