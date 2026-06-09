import { VolumeLoader } from "ami.js";
import { useEffect, useRef, useState } from "react";
import { resolveDataUrls } from "./useVolumeLoader";

interface UseLayerStackResult {
  stack: any | null;
  loading: boolean;
  error: Error | null;
}

/*
 * Like useVolumeLoader but does NOT call loader.free() or stack.prepare() —
 * raw data must remain in stack._rawData so createLayerMaterial can build
 * the DataTextures. Callers must call stack.prepare() and stack.pack() before
 * passing the stack to createLayerMaterial.
 */
export function useLayerStack(data: string | string[] | any | null): UseLayerStackResult {
  const [stack, setStack] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loaderRef = useRef<any>(null);

  useEffect(() => {
    const urls = resolveDataUrls(data);
    if (!urls) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setStack(null);

    const loader = new VolumeLoader();
    loaderRef.current = loader;

    loader
      .load(urls)
      .then(() => {
        if (cancelled) return;
        const series = loader.data[0].mergeSeries(loader.data)[0];
        // Do NOT call loader.free() — raw buffers are needed for texture building.
        loaderRef.current = null;
        const s = series.stack[0];
        s.prepare();
        s.pack();
        setStack(s);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      loaderRef.current?.free();
      loaderRef.current = null;
    };
  }, [JSON.stringify(resolveDataUrls(data))]);

  return { stack, loading, error };
}
