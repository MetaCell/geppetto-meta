import { useState, useEffect, useRef } from "react";
import { VolumeLoader } from "ami.js";

// Handles both a plain URL string/array and a Geppetto Instance model object.
export function resolveDataUrls(data: any): string[] | null {
  if (!data) return null;
  // Plain string or array — pass through
  if (typeof data === "string") return [data];
  if (Array.isArray(data)) return data;
  // Geppetto Instance model
  if (typeof data.getMetaType === "function" && data.getMetaType() === "Instance") {
    const value = data.getVariable().getInitialValues()[0].value;
    if (value.format === "NIFTI") return Array.isArray(value.data) ? value.data : [value.data];
  }
  return null;
}

interface UseVolumeLoaderResult {
  stack: any | null;
  loading: boolean;
  error: Error | null;
}

/*
 * Loads a DICOM/NIFTI/NRRD volume and returns the prepared StackModel.
 * Calls loader.free() after prepare() to release raw frame buffers.
 */
export function useVolumeLoader(data: string | string[] | any | null): UseVolumeLoaderResult {
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
        loader.free();
        loaderRef.current = null;
        const s = series.stack[0];
        s.prepare();
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
